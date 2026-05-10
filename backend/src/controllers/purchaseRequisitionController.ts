import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { generateSerialNumber } from '../utils/serialNumber';
import { v4 as uuidv4 } from 'uuid';

export const getPurchaseRequisitions = async (req: AuthRequest, res: Response) => {
  try {
    const { status, department_id, project_id, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let conditions = 'WHERE 1=1';
    const params: any[] = [];

    const userRole = req.user.role;
    if (userRole === 'Staff') {
      conditions += ' AND pr.requester_id = ?';
      params.push(req.user.id);
    } else if (userRole === 'Checker') {
      conditions += ' AND pr.department_id = ?';
      params.push(req.user.department_id);
    }

    if (status) { conditions += ' AND pr.status = ?'; params.push(status); }
    if (department_id && userRole !== 'Checker') { conditions += ' AND pr.department_id = ?'; params.push(department_id); }
    if (project_id) { conditions += ' AND pr.project_id = ?'; params.push(project_id); }

    const baseQuery = `
      SELECT pr.*, u.full_name as requester_name, d.name as department_name, p.name as project_name
      FROM purchase_requisitions pr
      JOIN users u ON pr.requester_id = u.id
      JOIN departments d ON pr.department_id = d.id
      LEFT JOIN projects p ON pr.project_id = p.id
      ${conditions}
    `;

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM purchase_requisitions pr JOIN users u ON pr.requester_id = u.id JOIN departments d ON pr.department_id = d.id LEFT JOIN projects p ON pr.project_id = p.id ${conditions}`, params);
    const total = Number((countResult.rows[0] as any).total);

    const result = await pool.query(baseQuery + ' ORDER BY pr.created_at DESC LIMIT ? OFFSET ?', [...params, Number(limit), offset]);

    res.json({
      data: result.rows,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPurchaseRequisition = async (req: AuthRequest, res: Response) => {
  try {
    const { project_id, reason, cheque_no, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one line item is required' });
    }

    await pool.query('START TRANSACTION');

    const serialNo = await generateSerialNumber('PR', 'purchase_requisitions');
    const total_requested = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
    const prId = uuidv4();

    await pool.query(
      `INSERT INTO purchase_requisitions (id, serial_no, requester_id, department_id, project_id, reason, cheque_no, total_requested, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [prId, serialNo, req.user.id, req.user.department_id, project_id || null, reason, cheque_no || null, total_requested]
    );

    for (const item of items) {
      const amount = Number(item.quantity) * Number(item.unit_price);
      await pool.query(
        `INSERT INTO pr_line_items (id, pr_id, description, unit, quantity, unit_price, requested_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), prId, item.description, item.unit, item.quantity, item.unit_price, amount]
      );
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'PR created successfully', data: { id: prId, serial_no: serialNo } });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error: ' + (error instanceof Error ? error.message : String(error)), stack: error instanceof Error ? error.stack : undefined });
  }
};

export const getPurchaseRequisitionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const prResult = await pool.query(
      `SELECT pr.*, u.full_name as requester_name, d.name as department_name, p.name as project_name
       FROM purchase_requisitions pr
       JOIN users u ON pr.requester_id = u.id
       JOIN departments d ON pr.department_id = d.id
       LEFT JOIN projects p ON pr.project_id = p.id
       WHERE pr.id = ?`,
      [id]
    );

    if (prResult.rows.length === 0) return res.status(404).json({ message: 'PR not found' });

    const pr = prResult.rows[0] as any;
    if (req.user.role === 'Staff' && pr.requester_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (req.user.role === 'Checker' && pr.department_id !== req.user.department_id) return res.status(403).json({ message: 'Forbidden' });

    const itemsResult = await pool.query('SELECT * FROM pr_line_items WHERE pr_id = ?', [id]);
    const approvalsResult = await pool.query(
      `SELECT a.*, u.full_name as actor_name FROM approval_actions a JOIN users u ON a.actor_id = u.id
       WHERE a.document_id = ? AND a.document_type = 'PR' ORDER BY a.acted_at ASC`,
      [id]
    );

    res.json({ ...pr, items: itemsResult.rows, approvals: approvalsResult.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePurchaseRequisition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { project_id, reason, cheque_no, items } = req.body;

    const prCheck = await pool.query('SELECT requester_id, status FROM purchase_requisitions WHERE id = ?', [id]);
    if (prCheck.rows.length === 0) return res.status(404).json({ message: 'PR not found' });
    const pr = prCheck.rows[0] as any;
    if (pr.requester_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (!['draft', 'returned'].includes(pr.status)) return res.status(400).json({ message: 'Cannot edit submitted PR' });

    await pool.query('START TRANSACTION');

    const total_requested = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);

    await pool.query(
      `UPDATE purchase_requisitions SET project_id = ?, reason = ?, cheque_no = ?, total_requested = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [project_id || null, reason, cheque_no || null, total_requested, id]
    );

    await pool.query('DELETE FROM pr_line_items WHERE pr_id = ?', [id]);

    for (const item of items) {
      const amount = Number(item.quantity) * Number(item.unit_price);
      await pool.query(
        `INSERT INTO pr_line_items (id, pr_id, description, unit, quantity, unit_price, requested_amount) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), id, item.description, item.unit, item.quantity, item.unit_price, amount]
      );
    }

    await pool.query('COMMIT');
    res.json({ message: 'PR updated successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitPurchaseRequisition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const prCheck = await pool.query('SELECT requester_id, status, department_id FROM purchase_requisitions WHERE id = ?', [id]);

    if (prCheck.rows.length === 0) return res.status(404).json({ message: 'PR not found' });
    const pr = prCheck.rows[0] as any;
    if (pr.requester_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (!['draft', 'returned'].includes(pr.status)) return res.status(400).json({ message: 'PR already submitted' });

    await pool.query("UPDATE purchase_requisitions SET status = 'submitted', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);

    const checkers = await pool.query("SELECT id FROM users WHERE role = 'Checker' AND department_id = ?", [pr.department_id]);
    for (const checker of (checkers.rows as any[])) {
      await pool.query(
        "INSERT INTO notifications (id, user_id, title, message, document_type, document_id) VALUES (?, ?, ?, ?, ?, ?)",
        [uuidv4(), checker.id, 'New PR to Check', 'A new PR has been submitted in your department.', 'PR', id]
      );
    }

    res.json({ message: 'PR submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePurchaseRequisition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const prCheck = await pool.query('SELECT requester_id, status FROM purchase_requisitions WHERE id = ?', [id]);

    if (prCheck.rows.length === 0) return res.status(404).json({ message: 'PR not found' });
    const pr = prCheck.rows[0] as any;
    if (pr.requester_id !== req.user.id && req.user.role !== 'System Admin') return res.status(403).json({ message: 'Forbidden' });
    if (pr.status !== 'draft') return res.status(400).json({ message: 'Only draft PRs can be deleted' });

    await pool.query('DELETE FROM purchase_requisitions WHERE id = ?', [id]);
    res.json({ message: 'PR deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
