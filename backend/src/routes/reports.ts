import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { pool } from '../config/database';
import { generatePDF, getPRTemplate } from '../services/pdfService';

const router = Router();
router.use(authenticate);

router.get('/spend_by_dept', async (req: Request, res: Response) => {
  try {
    const days = Number(req.query.days) || 30;
    const result = await pool.query(`
      SELECT d.name, SUM(p.amount_figure) as amount
      FROM payment_requests p
      JOIN departments d ON p.department_id = d.id
      WHERE p.status = 'disbursed' AND p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY d.id
    `, [days]);
    res.json({ chart: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/budget_vs_actual', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT d.name, COALESCE(SUM(prj.budget), 0) as budget,
             (SELECT COALESCE(SUM(amount_figure), 0) FROM payment_requests WHERE department_id = d.id AND status = 'disbursed') as actual
      FROM departments d
      LEFT JOIN projects prj ON prj.department_id = d.id
      GROUP BY d.id
    `);
    res.json({ chart: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/approval_cycle', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT document_type as name, AVG(DATEDIFF(acted_at, created_at)) as avg_days
      FROM approval_actions aa
      JOIN (
        SELECT id, created_at FROM purchase_requisitions
        UNION SELECT id, created_at FROM payment_requests
      ) docs ON aa.document_id = docs.id
      GROUP BY document_type
    `);
    res.json({ chart: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pending_aging', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT serial_no as doc, 'PR' as type, u.full_name as submitted_by, 
             DATEDIFF(NOW(), pr.created_at) as days, status
      FROM purchase_requisitions pr
      JOIN users u ON pr.requester_id = u.id
      WHERE status NOT IN ('approved', 'rejected', 'draft')
      UNION
      SELECT serial_no as doc, 'PRF' as type, u.full_name as submitted_by, 
             DATEDIFF(NOW(), p.created_at) as days, status
      FROM payment_requests p
      JOIN users u ON p.requester_id = u.id
      WHERE status NOT IN ('disbursed', 'rejected', 'draft')
      ORDER BY days DESC
    `);
    res.json({ items: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/supplier_perf', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT s.name, COUNT(g.id) as grn_count, 
             AVG(ABS(gi.quantity_received - pi.quantity) / pi.quantity * 100) as variance_pct
      FROM suppliers s
      JOIN goods_receiving_notes g ON g.supplier_id = s.id
      JOIN grn_line_items gi ON gi.grn_id = g.id
      JOIN pr_line_items pi ON g.pr_id = pi.pr_id AND gi.description = pi.description
      GROUP BY s.id
    `);
    res.json({ items: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/audit_log', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT u.email as user, a.action, a.entity_type as entity, a.created_at as timestamp
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json({ items: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/export/:type/:id', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const { settingsService } = require('../services/settingsService');
    const settings = await settingsService.getAllSettings();
    const brand = {
      logoUrl: settings['brand_logo_url'],
      companyName: settings['brand_company_name']
    };

    if (type === 'PR') {
      const prResult = await pool.query(
        `SELECT pr.*, u.full_name as requester_name, d.name as department_name
         FROM purchase_requisitions pr
         JOIN users u ON pr.requester_id = u.id
         JOIN departments d ON pr.department_id = d.id
         WHERE pr.id = ?`, [id]
      );
      if (prResult.rows.length === 0) return res.status(404).json({ message: 'Not found' });
      const itemsResult = await pool.query('SELECT * FROM pr_line_items WHERE pr_id = ?', [id]);
      html = require('../services/pdfService').getPRTemplate({ ...prResult.rows[0], items: itemsResult.rows }, brand);
    } else if (type === 'GRN') {
      const grnResult = await pool.query(
        `SELECT g.*, s.name as supplier_name, u.full_name as receiver_name
         FROM goods_receiving_notes g
         LEFT JOIN suppliers s ON g.supplier_id = s.id
         LEFT JOIN users u ON g.received_by = u.id
         WHERE g.id = ?`, [id]
      );
      if (grnResult.rows.length === 0) return res.status(404).json({ message: 'Not found' });
      const itemsResult = await pool.query('SELECT * FROM grn_line_items WHERE grn_id = ?', [id]);
      html = require('../services/pdfService').getGRNTemplate({ ...grnResult.rows[0], items: itemsResult.rows }, brand);
    } else if (type === 'SIV') {
      const sivResult = await pool.query(
        `SELECT s.*, u.full_name as issued_to_name, ib.full_name as issued_by_name
         FROM store_issued_vouchers s
         LEFT JOIN users u ON s.issued_to_id = u.id
         LEFT JOIN users ib ON s.issued_by = ib.id
         WHERE s.id = ?`, [id]
      );
      if (sivResult.rows.length === 0) return res.status(404).json({ message: 'Not found' });
      const itemsResult = await pool.query('SELECT * FROM siv_line_items WHERE siv_id = ?', [id]);
      html = require('../services/pdfService').getSIVTemplate({ ...sivResult.rows[0], items: itemsResult.rows }, brand);
    } else if (type === 'PRF') {
      const prfResult = await pool.query(
        `SELECT p.*, u.full_name as requester_name, d.name as department_name
         FROM payment_requests p
         JOIN users u ON p.requester_id = u.id
         JOIN departments d ON p.department_id = d.id
         WHERE p.id = ?`, [id]
      );
      if (prfResult.rows.length === 0) return res.status(404).json({ message: 'Not found' });
      html = require('../services/pdfService').getPRFTemplate(prfResult.rows[0], brand);
    } else {
      return res.status(400).json({ message: 'Document type not supported for export' });
    }

    const pdfBuffer = await generatePDF(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating PDF' });
  }
});

export default router;
