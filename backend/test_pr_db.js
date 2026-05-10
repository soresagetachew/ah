const { pool } = require('./src/config/database');
const { v4: uuidv4 } = require('uuid');

async function test() {
  try {
    console.log("Testing generateSerialNumber...");
    const { generateSerialNumber } = require('./src/utils/serialNumber');
    const serialNo = await generateSerialNumber('PR', 'purchase_requisitions');
    console.log("Serial No:", serialNo);

    console.log("Testing insert PR...");
    const prId = uuidv4();
    const reqUserId = '2c21dc7f-cd9f-43b9-aefb-b8c1a70519a4'; // dummy
    const reqDeptId = 'f76d91ad-a3c3-4c91-949e-b7d8d21b777a'; // dummy

    // Get a valid user and dept
    const users = await pool.query('SELECT id, department_id FROM users LIMIT 1');
    const u = users.rows[0];

    await pool.query('START TRANSACTION');

    await pool.query(
      `INSERT INTO purchase_requisitions (id, serial_no, requester_id, department_id, project_id, reason, cheque_no, total_requested, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [prId, serialNo, u.id, u.department_id, null, 'Test reason', null, 100]
    );

    console.log("Testing insert pr_line_items...");
    await pool.query(
      `INSERT INTO pr_line_items (id, pr_id, description, unit, quantity, unit_price, requested_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), prId, 'Test item', 'Pcs', 1, 100, 100]
    );

    await pool.query('ROLLBACK');
    console.log("SUCCESS!");
    process.exit(0);
  } catch (error) {
    console.error("ERROR CAUGHT:");
    console.error(error);
    process.exit(1);
  }
}

test();
