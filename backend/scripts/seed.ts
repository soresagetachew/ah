import { pool } from '../src/config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  try {
    console.log('Starting seeding...');

    // 1. Clear existing data
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('DELETE FROM approval_actions');
    await pool.query('DELETE FROM notifications');
    await pool.query('DELETE FROM audit_logs');
    await pool.query('DELETE FROM pr_line_items');
    await pool.query('DELETE FROM purchase_requisitions');
    await pool.query('DELETE FROM payment_requests');
    await pool.query('DELETE FROM goods_receiving_notes');
    await pool.query('DELETE FROM grn_line_items');
    await pool.query('DELETE FROM store_issued_vouchers');
    await pool.query('DELETE FROM siv_line_items');
    await pool.query('DELETE FROM inventory_movements');
    await pool.query('DELETE FROM inventory_items');
    await pool.query('DELETE FROM assets');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM projects');
    await pool.query('DELETE FROM departments');
    await pool.query('DELETE FROM suppliers');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Seed Departments
    const depts = [
      { id: uuidv4(), name: 'Finance' },
      { id: uuidv4(), name: 'Procurement' },
      { id: uuidv4(), name: 'Construction' },
      { id: uuidv4(), name: 'HR' },
      { id: uuidv4(), name: 'IT' },
      { id: uuidv4(), name: 'Store' }
    ];

    for (const dept of depts) {
      await pool.query('INSERT INTO departments (id, name) VALUES (?, ?)', [dept.id, dept.name]);
    }

    // 3. Seed Projects
    const projects = [
      { id: uuidv4(), name: 'HO Renovation', dept: 'HO', budget: 500000 },
      { id: uuidv4(), name: 'Real Estate Phase 1', dept: 'Construction', budget: 2000000 },
      { id: uuidv4(), name: 'IT Infrastructure', dept: 'IT', budget: 300000 }
    ];

    for (const p of projects) {
      const dept = depts.find(d => d.name === (p.dept === 'HO' ? 'Finance' : p.dept));
      await pool.query('INSERT INTO projects (id, name, department_id, budget) VALUES (?, ?, ?, ?)', [p.id, p.name, dept?.id || null, p.budget]);
    }

    // 4. Seed Suppliers
    const suppliers = [
      { id: uuidv4(), name: 'Addis Trading PLC', tin: '123456789' },
      { id: uuidv4(), name: 'Global Supplies Co.', tin: '987654321' }
    ];
    for (const s of suppliers) {
      await pool.query('INSERT INTO suppliers (id, name, tin_number) VALUES (?, ?, ?)', [s.id, s.name, s.tin]);
    }

    // 5. Seed Users for all 7 roles
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const roles = [
      { email: 'admin@ahg.com', name: 'System Admin', role: 'System Admin', dept: 'IT' },
      { email: 'gm@ahg.com', name: 'General Manager', role: 'GM', dept: 'Finance' },
      { email: 'finance@ahg.com', name: 'Finance Manager', role: 'Finance', dept: 'Finance' },
      { email: 'store@ahg.com', name: 'Store Keeper', role: 'Storekeeper', dept: 'Store' },
      { email: 'checker@ahg.com', name: 'Dept Checker', role: 'Checker', dept: 'Construction' },
      { email: 'staff@ahg.com', name: 'Staff Requester', role: 'Staff', dept: 'Construction' },
      { email: 'auditor@ahg.com', name: 'System Auditor', role: 'Auditor', dept: 'Finance' }
    ];

    for (const u of roles) {
      const dept = depts.find(d => d.name === u.dept);
      await pool.query(
        'INSERT INTO users (id, full_name, email, password_hash, role, department_id) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), u.name, u.email, passwordHash, u.role, dept?.id || null]
      );
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
