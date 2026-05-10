import { Router } from 'express';
import { 
  createPaymentRequest, 
  getPaymentRequests, 
  getPaymentRequestById, 
  updatePaymentRequest, 
  disbursePayment,
  getBudgetSummary
} from '../controllers/paymentRequestController';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';

const router = Router();
router.use(authenticate);

router.get('/budget-summary', checkRole(['Finance', 'GM', 'System Admin']), getBudgetSummary);
router.post('/', auditLog('create', 'PRF'), createPaymentRequest);
router.get('/', getPaymentRequests);
router.get('/:id', getPaymentRequestById);
router.put('/:id', auditLog('update', 'PRF'), updatePaymentRequest);
router.post('/:id/disburse', checkRole(['Finance', 'System Admin']), auditLog('disburse', 'PRF'), disbursePayment);

export default router;
