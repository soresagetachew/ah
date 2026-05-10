import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;
    const stats: any = {};

    if (role === 'GM' || role === 'System Admin' || role === 'Auditor') {
      const prCount = await pool.query('SELECT COUNT(*) as count FROM purchase_requisitions');
      const spend = await pool.query("SELECT SUM(amount_figure) as total FROM payment_requests WHERE status = 'disbursed'");
      const pending = await pool.query("SELECT COUNT(*) as count FROM purchase_requisitions WHERE status NOT IN ('approved', 'rejected', 'draft')");
      const rejected = await pool.query("SELECT COUNT(*) as count FROM purchase_requisitions WHERE status = 'rejected'");

      stats.gm = {
        totalPRs: prCount.rows[0].count,
        totalSpend: spend.rows[0].total || 0,
        pendingApprovals: pending.rows[0].count,
        rejectedCount: rejected.rows[0].count
      };
    }

    if (role === 'Finance') {
      const pendingPay = await pool.query("SELECT COUNT(*) as count FROM payment_requests WHERE status = 'authorized'");
      const disbursedMonth = await pool.query("SELECT SUM(amount_figure) as total FROM payment_requests WHERE status = 'disbursed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
      const recentPayments = await pool.query(`
        SELECT p.serial_no, d.name as department_name, p.amount_figure, p.created_at
        FROM payment_requests p
        JOIN departments d ON p.department_id = d.id
        WHERE p.status = 'disbursed'
        ORDER BY p.created_at DESC LIMIT 5
      `);

      stats.finance = {
        pendingPayments: pendingPay.rows[0].count,
        disbursedMonth: disbursedMonth.rows[0].total || 0,
        recentPayments: recentPayments.rows
      };
    }

    if (role === 'Storekeeper') {
      const inStock = await pool.query('SELECT COUNT(*) as count FROM inventory_items WHERE quantity > 0');
      const lowStock = await pool.query('SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= min_stock_level');
      const pendingGRN = await pool.query("SELECT COUNT(*) as count FROM goods_receiving_notes WHERE status = 'pending'");
      const lowStockItems = await pool.query(`
        SELECT item_name as name, current_stock as stock, minimum_stock as min
        FROM inventory_items
        WHERE current_stock <= minimum_stock
        LIMIT 5
      `);

      stats.store = {
        itemsInStock: inStock.rows[0].count,
        lowStockAlerts: lowStock.rows[0].count,
        pendingGRNs: pendingGRN.rows[0].count,
        lowStockItems: lowStockItems.rows
      };
    }

    if (role === 'Staff' || role === 'Checker') {
      const myRecent = await pool.query(`
        SELECT id, serial_no, status, created_at
        FROM purchase_requisitions
        WHERE requester_id = ?
        ORDER BY created_at DESC LIMIT 5
      `, [userId]);

      stats.staff = {
        recentRequests: myRecent.rows
      };
    }

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};
