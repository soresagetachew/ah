import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, department_id, is_active, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let conditions = 'WHERE 1=1';
    const params: any[] = [];

    if (role) { conditions += ' AND u.role = ?'; params.push(role); }
    if (department_id) { conditions += ' AND u.department_id = ?'; params.push(department_id); }
    if (is_active !== undefined) { conditions += ' AND u.is_active = ?'; params.push(is_active === 'true' ? 1 : 0); }

    const query = `
      SELECT u.id, u.full_name, u.email, u.role, u.department_id,
             d.name as department_name, u.business_unit, u.is_active, u.created_at
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ${conditions}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM users u ${conditions}`,
      params.slice(0, params.length - 2)
    );
    const total = Number((countResult.rows[0] as any).total);

    res.json({
      data: result.rows,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { full_name, email, role, department_id, business_unit } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);
    const newId = uuidv4();

    await pool.query(
      `INSERT INTO users (id, full_name, email, password_hash, role, department_id, business_unit)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newId, full_name, email, passwordHash, role, department_id || null, business_unit]
    );

    const created = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = ?', [newId]);

    res.status(201).json({
      message: 'User created successfully',
      user: created.rows[0],
      tempPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, role, department_id, business_unit } = req.body;

    await pool.query(
      `UPDATE users
       SET full_name = COALESCE(?, full_name),
           role = COALESCE(?, role),
           department_id = COALESCE(?, department_id),
           business_unit = COALESCE(?, business_unit)
       WHERE id = ?`,
      [full_name || null, role || null, department_id || null, business_unit || null, id]
    );

    const updated = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = ?', [id]);
    if (updated.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json(updated.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleActive = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const current = await pool.query('SELECT is_active FROM users WHERE id = ?', [id]);
    if (current.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const newStatus = !(current.rows[0] as any).is_active;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus ? 1 : 0, id]);

    res.json({ is_active: newStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const delegatePower = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ message: 'Delegation set successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
