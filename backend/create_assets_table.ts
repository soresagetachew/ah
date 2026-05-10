import { pool } from './src/config/database';

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        serial_number VARCHAR(100) UNIQUE,
        purchase_date DATE,
        purchase_price DECIMAL(15, 2),
        department_id CHAR(36),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id)
      )
    `);
    console.log("Assets table created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating assets table:", error);
    process.exit(1);
  }
}

createTable();
