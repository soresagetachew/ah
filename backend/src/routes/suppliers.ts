import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, name, tin_number, contact_info FROM suppliers ORDER BY name ASC');
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, tin_number, contact_info } = req.body;
    if (!name || !tin_number) return res.status(400).json({ message: 'Name and TIN number are required' });
    const id = require('uuid').v4();
    const result = await pool.query(
      'INSERT INTO suppliers (id, name, tin_number, contact_info) VALUES ($1, $2, $3, $4) RETURNING id, name, tin_number',
      [id, name, tin_number, contact_info]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
