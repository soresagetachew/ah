import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { generateSerialNumber } from '../utils/serialNumber';
import { amountToWords } from '../utils/amountToWords';
import { createNotification } from '../services/notificationService';

export const createPaymentRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { pr_id, business_unit, project_site, id_no, mode, amount_figure, purpose, linked_grn_id } = req.body;
    
    // Auto-generate amount in words
    const amount_words = amountToWords(Number(amount_figure));
    const serialNo = await generateSerialNumber('PRF', 'payment_requests');

    const prfResult = await pool.query(
      `INSERT INTO payment_requests 
       (serial_no, pr_id, requester_id, department_id, business_unit, project_site, id_no, mode, amount_figure, amount_words, purpose, linked_grn_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted') RETURNING *`,
      [serialNo, pr_id || null, req.user.id, req.user.department_id, business_unit, project_site, id_no, mode, amount_figure, amount_words, purpose, linked_grn_id || null]
    );

    // Notify checker
    const checkers = await pool.query("SELECT id FROM users WHERE role = 'Checker' AND department_id = ?", [req.user.department_id]);
    for (const checker of checkers.rows) {
      await createNotification(checker.id, 'New Payment Request', `A new PRF (${serialNo}) has been submitted for review.`, 'PRF', prfResult.rows[0].id);
    }

    res.status(201).json({ message: 'Payment Request created successfully', data: prfResult.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPaymentRequests = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.full_name as requester_name, d.name as department_name 
      FROM payment_requests p
      JOIN users u ON p.requester_id = u.id
      JOIN departments d ON p.department_id = d.id
      ORDER BY p.created_at DESC
    `);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPaymentRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, u.full_name as requester_name, d.name as department_name 
      FROM payment_requests p
      JOIN users u ON p.requester_id = u.id
      JOIN departments d ON p.department_id = d.id
      WHERE p.id = ?
    `, [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePaymentRequest = async (req: AuthRequest, res: Response) => {
  // Logic to update draft/returned PRF
  res.status(501).json({ message: 'Not implemented yet' });
};

export const disbursePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { account_checked_by, approved_by, budget_approved_by, cheque_number } = req.body;

    const prfCheck = await pool.query('SELECT status FROM payment_requests WHERE id = ?', [id]);
    if (prfCheck.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    if (prfCheck.rows[0].status !== 'authorized') {
      return res.status(400).json({ message: 'Payment must be authorized before disbursement' });
    }

    await pool.query(
      `UPDATE payment_requests 
       SET status = 'disbursed', account_checked_by = ?, approved_by = ?, budget_approved_by = ?, cheque_number = ?, disbursement_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [account_checked_by, approved_by, budget_approved_by, cheque_number || null, id]
    );

    res.json({ message: 'Payment disbursed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBudgetSummary = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.id as department_id, 
        d.name as department_name, 
        COALESCE(SUM(p.budget), 0) as allocated_budget,
        (SELECT COALESCE(SUM(amount_figure), 0) FROM payment_requests WHERE department_id = d.id AND status != 'rejected') as total_requested,
        (SELECT COALESCE(SUM(amount_figure), 0) FROM payment_requests WHERE department_id = d.id AND status = 'disbursed') as total_disbursed
      FROM departments d
      LEFT JOIN projects p ON p.department_id = d.id
      GROUP BY d.id, d.name
    `);

    const summary = result.rows.map(r => ({
      ...r,
      remaining: Number(r.allocated_budget) - Number(r.total_disbursed)
    }));

    res.json({ data: summary });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
