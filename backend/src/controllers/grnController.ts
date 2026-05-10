import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { generateSerialNumber } from '../utils/serialNumber';
import { createNotification } from '../services/notificationService';
import { v4 as uuidv4 } from 'uuid';

export const createGRN = async (req: AuthRequest, res: Response) => {
  try {
    const { pr_id, supplier_id, invoice_no, type_classification, line_items } = req.body;

    await pool.query('START TRANSACTION');

    const serialNo = await generateSerialNumber('GRN', 'goods_receiving_notes');
    const grnId = uuidv4();

    await pool.query(
      `INSERT INTO goods_receiving_notes (id, serial_no, pr_id, supplier_id, invoice_no, type_classification, status, received_by)
       VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)`,
      [grnId, serialNo, pr_id || null, supplier_id || null, invoice_no, type_classification || 'consumable', req.user.id]
    );

    const items = line_items || [];
    for (const item of items) {
      const total_cost = Number(item.quantity_received) * Number(item.unit_cost);

      await pool.query(
        `INSERT INTO grn_line_items (id, grn_id, description, unit, quantity_received, unit_cost, total_cost, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), grnId, item.description, item.unit, item.quantity_received, item.unit_cost, total_cost, item.remarks || null]
      );

      // Update inventory
      const invCheck = await pool.query('SELECT id, current_stock FROM inventory_items WHERE item_name = ?', [item.description]);
      if (invCheck.rows.length === 0) {
        const invId = uuidv4();
        await pool.query(
          'INSERT INTO inventory_items (id, item_name, unit, current_stock) VALUES (?, ?, ?, ?)',
          [invId, item.description, item.unit, item.quantity_received]
        );
        await pool.query(
          `INSERT INTO inventory_movements (id, item_id, movement_type, quantity, reference_type, reference_id, actor_id) VALUES (?, ?, 'IN', ?, 'GRN', ?, ?)`,
          [uuidv4(), invId, item.quantity_received, grnId, req.user.id]
        );
      } else {
        const invItem = invCheck.rows[0] as any;
        await pool.query('UPDATE inventory_items SET current_stock = current_stock + ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?', [item.quantity_received, invItem.id]);
        await pool.query(
          `INSERT INTO inventory_movements (id, item_id, movement_type, quantity, reference_type, reference_id, actor_id) VALUES (?, ?, 'IN', ?, 'GRN', ?, ?)`,
          [uuidv4(), invItem.id, item.quantity_received, grnId, req.user.id]
        );
      }
    }

    // Notify requester
    if (pr_id) {
      const prResult = await pool.query('SELECT requester_id FROM purchase_requisitions WHERE id = ?', [pr_id]);
      if (prResult.rows.length > 0) {
        await createNotification((prResult.rows[0] as any).requester_id, 'Goods Received', `Goods for your PR received via GRN ${serialNo}.`, 'GRN', grnId);
      }
    }

    // Notify Finance
    const financeUsers = await pool.query("SELECT id FROM users WHERE role = 'Finance'");
    for (const fin of (financeUsers.rows as any[])) {
      await createNotification(fin.id, 'New GRN Ready', `GRN ${serialNo} is ready for payment processing.`, 'GRN', grnId);
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'GRN created successfully', data: { id: grnId, serial_no: serialNo } });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGRNs = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT g.*, s.name as supplier_name, pr.serial_no as pr_serial_no, u.full_name as received_by_name
      FROM goods_receiving_notes g
      LEFT JOIN suppliers s ON g.supplier_id = s.id
      LEFT JOIN purchase_requisitions pr ON g.pr_id = pr.id
      LEFT JOIN users u ON g.received_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status) { query += ' AND g.status = ?'; params.push(status); }
    query += ' ORDER BY g.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGRNById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const grnResult = await pool.query(
      `SELECT g.*, s.name as supplier_name, pr.serial_no as pr_serial_no, u.full_name as receiver_name
       FROM goods_receiving_notes g
       LEFT JOIN suppliers s ON g.supplier_id = s.id
       LEFT JOIN purchase_requisitions pr ON g.pr_id = pr.id
       LEFT JOIN users u ON g.received_by = u.id
       WHERE g.id = ?`,
      [id]
    );

    if (grnResult.rows.length === 0) return res.status(404).json({ message: 'GRN not found' });

    const itemsResult = await pool.query('SELECT * FROM grn_line_items WHERE grn_id = ?', [id]);
    res.json({ ...grnResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
