import { pool } from '../config/database';
import { createNotification } from './notificationService';

export const submitForApproval = async (documentType: string, documentId: string, actorId: string, departmentId: string) => {
  const table = getTableName(documentType);
  if (!table) throw new Error('Invalid document type');

  await pool.query(`UPDATE ${table} SET status = 'submitted' WHERE id = ?`, [documentId]);
  
  // Logic to find next approver
  let nextApproverRole = '';
  if (documentType === 'PR') nextApproverRole = 'Checker';
  else if (documentType === 'PRF') nextApproverRole = 'Checker';
  else if (documentType === 'GRN') nextApproverRole = 'Finance';

  if (nextApproverRole) {
    const nextApprovers = await pool.query(
      `SELECT id FROM users WHERE role = ? AND (department_id = ? OR ? IS NULL) AND is_active = true`,
      [nextApproverRole, documentType === 'GRN' ? null : departmentId, documentType === 'GRN' ? null : departmentId]
    );

    for (const approver of nextApprovers.rows) {
      await createNotification(approver.id, `New ${documentType} to Check`, `A new ${documentType} has been submitted for your review.`, documentType, documentId);
    }
  }
};

export const approve = async (documentType: string, documentId: string, actorId: string, role: string, comment?: string) => {
  const table = getTableName(documentType);
  if (!table) throw new Error('Invalid document type');

  await pool.query(
    `INSERT INTO approval_actions (id, document_type, document_id, actor_id, action, comment) VALUES (?, ?, ?, ?, 'approve', ?)`,
    [uuidv4(), documentType, documentId, actorId, comment || null]
  );

  let newStatus = 'approved';
  // Check if more approvals needed based on rules
  if (documentType === 'PR' && role === 'Checker') newStatus = 'under review'; // Needs GM
  if (documentType === 'PRF' && role === 'Checker') newStatus = 'checked'; // Needs Authorized Signatory
  if (documentType === 'PRF' && role === 'GM') newStatus = 'authorized';

  await pool.query(`UPDATE ${table} SET status = ? WHERE id = ?`, [newStatus, documentId]);

  // Compute integrity hash if final approval
  if (newStatus === 'approved' || newStatus === 'authorized' || newStatus === 'disbursed') {
    const docData = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [documentId]);
    const hash = crypto.createHash('sha256').update(JSON.stringify(docData.rows[0])).digest('hex');
    // We assume the column exists or we just log it if we haven't added it yet
    try {
      await pool.query(`UPDATE ${table} SET integrity_hash = ? WHERE id = ?`, [hash, documentId]);
    } catch (e) {
      console.log(`Integrity hash computed for ${documentType} ${documentId}: ${hash} (Column 'integrity_hash' missing?)`);
    }
  }

  if (newStatus === 'under review' && documentType === 'PR') {
    // Notify GM
    const gms = await pool.query("SELECT id FROM users WHERE role = 'GM' AND is_active = true");
    for (const gm of gms.rows) {
      await createNotification(gm.id, `PR Requires Final Approval`, `A PR has been checked and requires your approval.`, documentType, documentId);
    }
  }

  // Notify requester
  const docInfo = await pool.query(`SELECT requester_id FROM ${table} WHERE id = ?`, [documentId]);
  if (docInfo.rows.length > 0 && docInfo.rows[0].requester_id) {
    await createNotification(docInfo.rows[0].requester_id, `${documentType} Approved`, `Your ${documentType} was approved by ${role}.`, documentType, documentId);
  }

  // If PR approved, notify storekeeper
  if (newStatus === 'approved' && documentType === 'PR') {
    const storekeepers = await pool.query("SELECT id FROM users WHERE role = 'Storekeeper' AND is_active = true");
    for (const sk of storekeepers.rows) {
      await createNotification(sk.id, `New Approved PR`, `A PR was approved. Please prepare a GRN when goods arrive.`, documentType, documentId);
    }
  }
};

export const reject = async (documentType: string, documentId: string, actorId: string, comment: string) => {
  const table = getTableName(documentType);
  if (!table) throw new Error('Invalid document type');

  await pool.query(
    `INSERT INTO approval_actions (id, document_type, document_id, actor_id, action, comment) VALUES (?, ?, ?, ?, 'reject', ?)`,
    [require('uuid').v4(), documentType, documentId, actorId, comment]
  );

  await pool.query(`UPDATE ${table} SET status = 'rejected' WHERE id = ?`, [documentId]);

  const docInfo_reject = await pool.query(`SELECT requester_id FROM ${table} WHERE id = ?`, [documentId]);
  if (docInfo_reject.rows.length > 0 && docInfo_reject.rows[0].requester_id) {
    await createNotification(docInfo_reject.rows[0].requester_id, `${documentType} Rejected`, `Your ${documentType} was rejected. Reason: ${comment}`, documentType, documentId);
  }
};

export const returnForRevision = async (documentType: string, documentId: string, actorId: string, comment: string) => {
  const table = getTableName(documentType);
  if (!table) throw new Error('Invalid document type');

  await pool.query(
    `INSERT INTO approval_actions (id, document_type, document_id, actor_id, action, comment) VALUES (?, ?, ?, ?, 'return', ?)`,
    [require('uuid').v4(), documentType, documentId, actorId, comment]
  );

  await pool.query(`UPDATE ${table} SET status = 'returned' WHERE id = ?`, [documentId]);

  const docInfo_return = await pool.query(`SELECT requester_id FROM ${table} WHERE id = ?`, [documentId]);
  if (docInfo_return.rows.length > 0 && docInfo_return.rows[0].requester_id) {
    await createNotification(docInfo_return.rows[0].requester_id, `${documentType} Returned`, `Your ${documentType} was returned for revision. Reason: ${comment}`, documentType, documentId);
  }
};

export const getPendingApprovals = async (role: string, departmentId: string) => {
  let queries = [];
  
  if (role === 'Checker') {
    queries.push(`
      SELECT 'PR' as doc_type, id, serial_no, requester_id, total_requested as amount, created_at, status 
      FROM purchase_requisitions WHERE status = 'submitted' AND department_id = '${departmentId}'
    `);
    queries.push(`
      SELECT 'PRF' as doc_type, id, serial_no, requester_id, amount_figure as amount, created_at, status 
      FROM payment_requests WHERE status = 'submitted' AND department_id = '${departmentId}'
    `);
  } else if (role === 'GM') {
    queries.push(`
      SELECT 'PR' as doc_type, id, serial_no, requester_id, total_requested as amount, created_at, status 
      FROM purchase_requisitions WHERE status = 'under review'
    `);
    queries.push(`
      SELECT 'PRF' as doc_type, id, serial_no, requester_id, amount_figure as amount, created_at, status 
      FROM payment_requests WHERE status = 'checked'
    `);
  } else if (role === 'Finance') {
    queries.push(`
      SELECT 'PRF' as doc_type, id, serial_no, requester_id, amount_figure as amount, created_at, status 
      FROM payment_requests WHERE status = 'authorized'
    `);
  }

  if (queries.length === 0) return [];

  const combinedQuery = queries.join(' UNION ALL ') + ' ORDER BY created_at ASC';
  const result = await pool.query(combinedQuery);
  
  // Enrich with user names
  const enrichResults = await Promise.all(result.rows.map(async (row) => {
    const user = await pool.query('SELECT full_name, d.name as department_name FROM users u JOIN departments d ON u.department_id = d.id WHERE u.id = ?', [row.requester_id]);
    return {
      ...row,
      requester_name: user.rows[0]?.full_name,
      department_name: user.rows[0]?.department_name,
    };
  }));

  return enrichResults;
};

const getTableName = (documentType: string) => {
  switch (documentType) {
    case 'PR': return 'purchase_requisitions';
    case 'GRN': return 'goods_receiving_notes';
    case 'SIV': return 'store_issued_vouchers';
    case 'PRF': return 'payment_requests';
    default: return null;
  }
};
