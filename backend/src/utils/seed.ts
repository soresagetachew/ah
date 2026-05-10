import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

interface SeedUser {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: string;
  business_unit: string;
  dept_key: string;
}

async function seed() {
  console.log('🔌 Connecting to MySQL...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'ahg_procurement';

  console.log(`📦 Creating database '${dbName}' if not exists...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);

  console.log('🛠  Running schema migrations...');
  const schemaPath = path.join(__dirname, '..', '..', 'database', 'mysql_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema.split(';').filter(stmt => stmt.trim() !== '');

  for (const stmt of statements) {
    if (stmt.trim()) {
      try {
        await connection.query(stmt);
      } catch (e: any) {
        if (!e.message.includes('already exists')) {
          console.warn(`  ⚠ ${stmt.substring(0, 60).trim()}... → ${e.message}`);
        }
      }
    }
  }

  console.log('🌱 Seeding departments...');

  const departments: Record<string, string> = {};
  const deptDefs = [
    { name: 'Finance & Accounting' },
    { name: 'Procurement & Supply' },
    { name: 'Construction & Real Estate' },
    { name: 'Store / Warehouse' },
    { name: 'HR & Administration' },
    { name: 'IT & Systems' },
  ];

  for (const dept of deptDefs) {
    let id: string;
    const [existing]: any = await connection.query('SELECT id FROM departments WHERE name = ?', [dept.name]);
    if (existing.length > 0) {
      id = existing[0].id;
    } else {
      id = uuidv4();
      await connection.query('INSERT INTO departments (id, name) VALUES (?, ?)', [id, dept.name]);
    }
    departments[dept.name] = id;
  }
  console.log(`  ✓ ${deptDefs.length} departments ready`);

  console.log('🌱 Seeding suppliers...');
  const supplierDefs = [
    { name: 'Addis Trading PLC', tin_number: 'TIN-ET-001', contact_info: 'addis@trading.et' },
    { name: 'Shewa Supplies Ltd', tin_number: 'TIN-ET-002', contact_info: 'shewa@supplies.et' },
    { name: 'ET Procurement Co', tin_number: 'TIN-ET-003', contact_info: 'info@etprocurement.et' },
  ];
  for (const s of supplierDefs) {
    const [existing]: any = await connection.query('SELECT id FROM suppliers WHERE tin_number = ?', [s.tin_number]);
    if (existing.length === 0) {
      await connection.query(
        'INSERT INTO suppliers (id, name, tin_number, contact_info) VALUES (?, ?, ?, ?)',
        [uuidv4(), s.name, s.tin_number, s.contact_info]
      );
    }
  }
  console.log(`  ✓ ${supplierDefs.length} suppliers ready`);

  console.log('🌱 Seeding users...');
  const users: SeedUser[] = [
    { id: uuidv4(), full_name: 'System Administrator', email: 'admin@ahg.com',        password: 'Admin@123',  role: 'System Admin', business_unit: 'HO',           dept_key: 'IT & Systems' },
    { id: uuidv4(), full_name: 'Kebede Alemu (GM)',    email: 'gm@ahg.com',           password: 'GM@ahg123',  role: 'GM',           business_unit: 'HO',           dept_key: 'HR & Administration' },
    { id: uuidv4(), full_name: 'Sara Mengistu',        email: 'finance@ahg.com',      password: 'Finance@123',role: 'Finance',      business_unit: 'HO',           dept_key: 'Finance & Accounting' },
    { id: uuidv4(), full_name: 'Tadesse Haile',        email: 'store@ahg.com',        password: 'Store@123',  role: 'Storekeeper',  business_unit: 'HO',           dept_key: 'Store / Warehouse' },
    { id: uuidv4(), full_name: 'Mekdes Bekele',        email: 'checker1@ahg.com',     password: 'Check@123',  role: 'Checker',      business_unit: 'HO',           dept_key: 'Procurement & Supply' },
    { id: uuidv4(), full_name: 'Dawit Tesfaye',        email: 'checker2@ahg.com',     password: 'Check@123',  role: 'Checker',      business_unit: 'Construction', dept_key: 'Construction & Real Estate' },
    { id: uuidv4(), full_name: 'Abebe Kebede',         email: 'staff1@ahg.com',       password: 'Staff@123',  role: 'Staff',        business_unit: 'HO',           dept_key: 'Finance & Accounting' },
    { id: uuidv4(), full_name: 'Tigist Worku',         email: 'staff2@ahg.com',       password: 'Staff@123',  role: 'Staff',        business_unit: 'Construction', dept_key: 'Construction & Real Estate' },
    { id: uuidv4(), full_name: 'Yohannes Girma',       email: 'staff3@ahg.com',       password: 'Staff@123',  role: 'Staff',        business_unit: 'Kodeko',       dept_key: 'HR & Administration' },
    { id: uuidv4(), full_name: 'Hiwot Alemu',          email: 'staff4@ahg.com',       password: 'Staff@123',  role: 'Staff',        business_unit: 'School',       dept_key: 'HR & Administration' },
    { id: uuidv4(), full_name: 'Biruk Tadesse',        email: 'staff5@ahg.com',       password: 'Staff@123',  role: 'Staff',        business_unit: 'Ocean',        dept_key: 'Procurement & Supply' },
  ];

  for (const u of users) {
    const [existing]: any = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);
    if (existing.length > 0) {
      console.log(`  → ${u.email} already exists, skipping`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 10);
    const deptId = departments[u.dept_key] || departments['IT & Systems'];
    await connection.query(
      'INSERT INTO users (id, full_name, email, password_hash, role, department_id, business_unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [u.id, u.full_name, u.email, hash, u.role, deptId, u.business_unit]
    );
    console.log(`  ✓ ${u.role.padEnd(12)} → ${u.email} (pw: ${u.password})`);
  }

  await connection.end();
  console.log('\n✅ Database seeded successfully!');
  console.log('\n--- Login Credentials ---');
  console.log('Admin:      admin@ahg.com        / Admin@123');
  console.log('GM:         gm@ahg.com           / GM@ahg123');
  console.log('Finance:    finance@ahg.com       / Finance@123');
  console.log('Storekeeper:store@ahg.com         / Store@123');
  console.log('Checker 1:  checker1@ahg.com      / Check@123');
  console.log('Checker 2:  checker2@ahg.com      / Check@123');
  console.log('Staff 1-5:  staff1..5@ahg.com     / Staff@123');
  console.log('-------------------------');
}

seed().catch(console.error);
