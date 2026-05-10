import { Router } from 'express';
import { getUsers, createUser, updateUser, toggleActive, delegatePower } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/', checkRole(['System Admin', 'GM']), getUsers);
router.post('/', checkRole(['System Admin']), auditLog('create', 'user'), createUser);
router.put('/:id', checkRole(['System Admin']), auditLog('update', 'user'), updateUser);
router.patch('/:id/toggle-active', checkRole(['System Admin']), auditLog('toggle_active', 'user'), toggleActive);
router.post('/:id/delegate', checkRole(['System Admin']), auditLog('delegate', 'user'), delegatePower);

export default router;
