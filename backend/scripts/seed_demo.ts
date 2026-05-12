import { pool } from '../src/config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedDemo() {
  try {
    console.log('🚀 Starting Comprehensive Demo Seeding...');

    // 1. Clear existing data in reverse order of dependencies
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'approval_actions', 'notifications', 'audit_logs', 
      'pr_line_items', 'purchase_requisitions', 
      'grn_line_items', 'goods_receiving_notes',
      'siv_line_items', 'store_issued_vouchers',
      'inventory_movements', 'inventory_items',
      'payment_requests', 'users', 'projects', 'departments', 'suppliers'
    ];
    for (const table of tables) {
      await pool.query(`DELETE FROM ${table}`);
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Databases cleared.');

    // 2. Seed Departments
    const depts = [
      { id: uuidv4(), name: 'Finance & Accounts' },
      { id: uuidv4(), name: 'Procurement & Supply Chain' },
      { id: uuidv4(), name: 'Construction & Real Estate' },
      { id: uuidv4(), name: 'IT & Digital Transformation' },
      { id: uuidv4(), name: 'Human Resources' },
      { id: uuidv4(), name: 'General Services' },
      { id: uuidv4(), name: 'Store & Warehouse' }
    ];
    for (const d of depts) {
      await pool.query('INSERT INTO departments (id, name) VALUES (?, ?)', [d.id, d.name]);
    }
    console.log('✅ Departments seeded.');

    // 3. Seed Projects
    const projects = [
      { id: uuidv4(), name: 'HO Office Renovation', dept: 'Finance & Accounts', budget: 1500000 },
      { id: uuidv4(), name: 'Luxury Villa Phase 2', dept: 'Construction & Real Estate', budget: 5000000 },
      { id: uuidv4(), name: 'ERP Implementation', dept: 'IT & Digital Transformation', budget: 2500000 },
      { id: uuidv4(), name: 'Staff Training 2025', dept: 'Human Resources', budget: 800000 },
      { id: uuidv4(), name: 'Warehouse Automation', dept: 'Store & Warehouse', budget: 1200000 }
    ];
    for (const p of projects) {
      const dept = depts.find(d => d.name === p.dept);
      await pool.query('INSERT INTO projects (id, name, department_id, budget) VALUES (?, ?, ?, ?)', 
        [p.id, p.name, dept?.id, p.budget]);
    }
    console.log('✅ Projects seeded.');

    // 4. Seed Suppliers
    const suppliers = [
      { id: uuidv4(), name: 'Addis Office Solutions', tin: '123456789', contact: 'Abebe Kebede' },
      { id: uuidv4(), name: 'Global Tech Imports', tin: '987654321', contact: 'Sara Daniel' },
      { id: uuidv4(), name: 'Construct-All Ethiopia', tin: '456789123', contact: 'Mulugeta Tesfaye' },
      { id: uuidv4(), name: 'Safe-Guard Security', tin: '321654987', contact: 'Hirut Belay' }
    ];
    for (const s of suppliers) {
      await pool.query('INSERT INTO suppliers (id, name, tin_number, contact_info) VALUES (?, ?, ?, ?)', 
        [s.id, s.name, s.tin, s.contact]);
    }
    console.log('✅ Suppliers seeded.');

    // 5. Seed Users
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const users = [
      { id: uuidv4(), email: 'admin@ahg.com', name: 'System Admin', role: 'System Admin', dept: 'IT & Digital Transformation' },
      { id: uuidv4(), email: 'gm@ahg.com', name: 'General Manager', role: 'GM', dept: 'Finance & Accounts' },
      { id: uuidv4(), email: 'finance@ahg.com', name: 'Finance Manager', role: 'Finance', dept: 'Finance & Accounts' },
      { id: uuidv4(), email: 'store@ahg.com', name: 'Store Keeper', role: 'Storekeeper', dept: 'Store & Warehouse' },
      { id: uuidv4(), email: 'checker@ahg.com', name: 'Dept Checker', role: 'Checker', dept: 'Construction & Real Estate' },
      { id: uuidv4(), email: 'staff@ahg.com', name: 'Staff Requester', role: 'Staff', dept: 'Construction & Real Estate' },
      { id: uuidv4(), email: 'auditor@ahg.com', name: 'System Auditor', role: 'Auditor', dept: 'Finance & Accounts' }
    ];
    for (const u of users) {
      const dept = depts.find(d => d.name === u.dept);
      await pool.query(
        'INSERT INTO users (id, full_name, email, password_hash, role, department_id, business_unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [u.id, u.name, u.email, passwordHash, u.role, dept?.id, 'HO']
      );
    }
    console.log('✅ Users seeded.');

    const staffId = users.find(u => u.role === 'Staff')?.id;
    const checkerId = users.find(u => u.role === 'Checker')?.id;
    const gmId = users.find(u => u.role === 'GM')?.id;
    const financeId = users.find(u => u.role === 'Finance')?.id;
    const storeId = users.find(u => u.role === 'Storekeeper')?.id;
    const constDeptId = depts.find(d => d.name === 'Construction & Real Estate')?.id;
    const villaProjectId = projects.find(p => p.name === 'Luxury Villa Phase 2')?.id;

    // 6. Seed Inventory Items
    const inventoryItems = [
      { id: uuidv4(), name: 'Cement (50kg Bag)', unit: 'Bag', stock: 500, min: 100, cost: 'Construction' },
      { id: uuidv4(), name: 'Rebar 12mm', unit: 'Pcs', stock: 200, min: 50, cost: 'Construction' },
      { id: uuidv4(), name: 'Laptop Dell XPS', unit: 'Pcs', stock: 5, min: 2, cost: 'IT' },
      { id: uuidv4(), name: 'Office Chair', unit: 'Pcs', stock: 15, min: 5, cost: 'HO' }
    ];
    for (const item of inventoryItems) {
      await pool.query('INSERT INTO inventory_items (id, item_name, unit, current_stock, minimum_stock, cost_center) VALUES (?, ?, ?, ?, ?, ?)',
        [item.id, item.name, item.unit, item.stock, item.min, item.cost]);
    }
    console.log('✅ Inventory seeded.');

    // 7. Seed Purchase Requisitions
    const prs = [
      { id: uuidv4(), serial: 'PR-2025-0001', status: 'approved', total: 45000, reason: 'Materials for villa foundation' },
      { id: uuidv4(), serial: 'PR-2025-0002', status: 'submitted', total: 12000, reason: 'Office supplies for Q1' },
      { id: uuidv4(), serial: 'PR-2025-0003', status: 'draft', total: 5000, reason: 'Computer maintenance tools' },
      { id: uuidv4(), serial: 'PR-2025-0004', status: 'rejected', total: 85000, reason: 'Emergency generator repair' }
    ];

    for (const pr of prs) {
      await pool.query(
        'INSERT INTO purchase_requisitions (id, serial_no, requester_id, department_id, project_id, reason, status, total_requested) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [pr.id, pr.serial, staffId, constDeptId, villaProjectId, pr.reason, pr.status, pr.total]
      );

      // Line items
      await pool.query(
        'INSERT INTO pr_line_items (id, pr_id, description, unit, quantity, unit_price, requested_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), pr.id, 'Standard Item', 'Pcs', 1, pr.total, pr.total]
      );
    }
    console.log('✅ PRs seeded.');

    // 8. Seed GRNs for Approved PRs
    const approvedPR = prs.find(p => p.status === 'approved');
    const supplierId = suppliers[0].id;
    const grnId = uuidv4();
    if (approvedPR) {
      await pool.query(
        'INSERT INTO goods_receiving_notes (id, serial_no, pr_id, supplier_id, invoice_no, type_classification, status, received_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [grnId, 'GRN-2025-0001', approvedPR.id, supplierId, 'INV-9988', 'fixed_asset', 'completed', storeId]
      );

      await pool.query(
        'INSERT INTO grn_line_items (id, grn_id, description, unit, quantity_received, unit_cost, total_cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), grnId, 'Standard Item', 'Pcs', 1, approvedPR.total, approvedPR.total]
      );
    }
    console.log('✅ GRNs seeded.');

    // 9. Seed SIVs
    if (grnId) {
      const sivId = uuidv4();
      await pool.query(
        'INSERT INTO store_issued_vouchers (id, serial_no, grn_id, issued_to_id, cost_center, status, issued_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [sivId, 'SIV-2025-0001', grnId, staffId, 'Project-Villa', 'issued', storeId]
      );

      await pool.query(
        'INSERT INTO siv_line_items (id, siv_id, description, unit, qty_issued, unit_cost, total_cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), sivId, 'Standard Item', 'Pcs', 1, approvedPR?.total || 0, approvedPR?.total || 0]
      );
    }
    console.log('✅ SIVs seeded.');

    // 10. Seed Payment Requests
    if (approvedPR) {
      await pool.query(
        'INSERT INTO payment_requests (id, serial_no, pr_id, requester_id, department_id, mode, amount_figure, amount_words, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), 'PRF-2025-0001', approvedPR.id, staffId, constDeptId, 'cheque', approvedPR.total, 'Forty Five Thousand Birr Only', 'Payment for materials', 'authorized']
      );
    }
    console.log('✅ Payment Requests seeded.');

    // 11. Seed Approval Actions & Notifications
    const docId = approvedPR?.id;
    if (docId) {
      await pool.query(
        'INSERT INTO approval_actions (id, document_type, document_id, actor_id, action, comment) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), 'PR', docId, checkerId, 'approve', 'Verified and looks good.']
      );
      await pool.query(
        'INSERT INTO approval_actions (id, document_type, document_id, actor_id, action, comment) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), 'PR', docId, gmId, 'approve', 'Proceed with procurement.']
      );

      await pool.query(
        'INSERT INTO notifications (id, user_id, title, message, document_type, document_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), staffId, 'PR Approved', 'Your PR-2025-0001 has been approved by GM.', 'PR', docId]
      );
    }
    console.log('✅ Notifications & Approvals seeded.');

    console.log('✨ Comprehensive Demo Seeding Completed Successfully! ✨');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDemo();
