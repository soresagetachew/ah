import { Router } from 'express';
import { createSIV, getSIVs, getSIVById } from '../controllers/sivController';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);


router.post('/', checkRole(['Storekeeper', 'System Admin', 'GM']), auditLog('create', 'SIV'), createSIV);
router.get('/', getSIVs);
router.get('/:id', getSIVById);

export default router;
