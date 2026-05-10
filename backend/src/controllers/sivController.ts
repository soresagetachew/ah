import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { generateSerialNumber } from '../utils/serialNumber';
import { v4 as uuidv4 } from 'uuid';

export const createSIV = async (req: AuthRequest, res: Response) => {
  try {
    const { grn_id, issued_to_id, cost_center, line_items } = req.body;

    if (!issued_to_id) return res.status(400).json({ message: 'Recipient (issued_to_id) is required' });

    await pool.query('START TRANSACTION');

    const serialNo = await generateSerialNumber('SIV', 'store_issued_vouchers');
    const sivId = uuidv4();

    // Validate stock before issuing
    for (const item of (line_items || [])) {
      if (item.available_stock && Number(item.qty_issued) > Number(item.available_stock)) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: `Insufficient stock for "${item.description}" (available: ${item.available_stock})` });
      }
    }

    await pool.query(
      `INSERT INTO store_issued_vouchers (id, serial_no, grn_id, issued_to_id, cost_center, status, issued_by)
       VALUES (?, ?, ?, ?, ?, 'issued', ?)`,
      [sivId, serialNo, grn_id || null, issued_to_id, cost_center || null, req.user.id]
    );

    let totalCost = 0;
    for (const item of (line_items || [])) {
      const total = Number(item.qty_issued) * Number(item.unit_cost);
      totalCost += total;

      await pool.query(
        `INSERT INTO siv_line_items (id, siv_id, description, unit, qty_issued, unit_cost, total_cost)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), sivId, item.description, item.unit, item.qty_issued, item.unit_cost, total]
      );

      // Deduct from inventory
      const invItem = await pool.query('SELECT id FROM inventory_items WHERE item_name = ?', [item.description]);
      if (invItem.rows.length > 0) {
        const itemId = (invItem.rows[0] as any).id;
        await pool.query('UPDATE inventory_items SET current_stock = current_stock - ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?', [item.qty_issued, itemId]);
        await pool.query(
          `INSERT INTO inventory_movements (id, item_id, movement_type, quantity, reference_type, reference_id, actor_id) VALUES (?, ?, 'OUT', ?, 'SIV', ?, ?)`,
          [uuidv4(), itemId, item.qty_issued, sivId, req.user.id]
        );
      }
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'SIV created successfully', data: { id: sivId, serial_no: serialNo, total_cost: totalCost } });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSIVs = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT s.*, g.serial_no as grn_serial_no, u.full_name as issued_to_name, ib.full_name as issued_by_name
      FROM store_issued_vouchers s
      LEFT JOIN goods_receiving_notes g ON s.grn_id = g.id
      LEFT JOIN users u ON s.issued_to_id = u.id
      LEFT JOIN users ib ON s.issued_by = ib.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status) { query += ' AND s.status = ?'; params.push(status); }
    query += ' ORDER BY s.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSIVById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sivResult = await pool.query(
      `SELECT s.*, g.serial_no as grn_serial_no, u.full_name as issued_to_name
       FROM store_issued_vouchers s
       LEFT JOIN goods_receiving_notes g ON s.grn_id = g.id
       LEFT JOIN users u ON s.issued_to_id = u.id
       WHERE s.id = ?`,
      [id]
    );
    if (sivResult.rows.length === 0) return res.status(404).json({ message: 'SIV not found' });

    const itemsResult = await pool.query('SELECT * FROM siv_line_items WHERE siv_id = ?', [id]);
    res.json({ ...sivResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
