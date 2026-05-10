import { Router } from 'express';
import { createGRN, getGRNs, getGRNById } from '../controllers/grnController';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

router.post('/', checkRole(['Storekeeper', 'System Admin', 'GM']), auditLog('create', 'GRN'), createGRN);
router.get('/', getGRNs);
router.get('/:id', getGRNById);

export default router;
