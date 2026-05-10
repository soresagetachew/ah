import { Router } from 'express';
import { login, getMe, logout, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.post('/login', auditLog('login', 'user'), login);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, auditLog('logout', 'user'), logout);
router.post('/change-password', authenticate, auditLog('change_password', 'user'), changePassword);

export default router;
