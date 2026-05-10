import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { approve, reject, returnForRevision, getPendingApprovals } from '../services/approvalService';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

router.get('/pending', async (req: any, res: Response) => {
  try {
    const data = await getPendingApprovals(req.user.role, req.user.department_id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/action', auditLog('approval_action', 'document'), async (req: any, res: Response) => {
  try {
    const { documentType, documentId, action, comment } = req.body;
    
    if (action === 'approve') {
      await approve(documentType, documentId, req.user.id, req.user.role, comment);
    } else if (action === 'reject') {
      if (!comment) return res.status(400).json({ message: 'Comment required for rejection' });
      await reject(documentType, documentId, req.user.id, comment);
    } else if (action === 'return') {
      if (!comment) return res.status(400).json({ message: 'Comment required for return' });
      await returnForRevision(documentType, documentId, req.user.id, comment);
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ message: `Document ${action}ed successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
