import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const getAssets = async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, department_id, search } = req.query;
    let query = `
      SELECT a.*, d.name as department_name 
      FROM assets a 
      LEFT JOIN departments d ON a.department_id = d.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      query += ` AND a.category = ?`;
      params.push(category);
    }
    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }
    if (department_id) {
      query += ` AND a.department_id = ?`;
      params.push(department_id);
    }
    if (search) {
      query += ` AND (a.name LIKE ? OR a.serial_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description, serial_number, purchase_date, purchase_price, department_id } = req.body;
    const id = uuidv4();

    await pool.query(
      `INSERT INTO assets (id, name, category, description, serial_number, purchase_date, purchase_price, department_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, category, description, serial_number, purchase_date, purchase_price, department_id]
    );

    res.status(201).json({ id, message: 'Asset created successfully' });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Serial number already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, description, serial_number, purchase_date, purchase_price, department_id, status } = req.body;

    await pool.query(
      `UPDATE assets 
       SET name = ?, category = ?, description = ?, serial_number = ?, purchase_date = ?, purchase_price = ?, department_id = ?, status = ? 
       WHERE id = ?`,
      [name, category, description, serial_number, purchase_date, purchase_price, department_id, status, id]
    );

    res.json({ message: 'Asset updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM assets WHERE id = ?', [id]);
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
