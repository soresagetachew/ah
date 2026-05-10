import { Router } from 'express';
import { 
  getPurchaseRequisitions, 
  createPurchaseRequisition, 
  getPurchaseRequisitionById, 
  updatePurchaseRequisition, 
  submitPurchaseRequisition, 
  deletePurchaseRequisition 
} from '../controllers/purchaseRequisitionController';
import { authenticate } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/', getPurchaseRequisitions);
router.post('/', auditLog('create', 'PR'), createPurchaseRequisition);
router.get('/:id', getPurchaseRequisitionById);
router.put('/:id', auditLog('update', 'PR'), updatePurchaseRequisition);
router.post('/:id/submit', auditLog('submit', 'PR'), submitPurchaseRequisition);
router.delete('/:id', auditLog('delete', 'PR'), deletePurchaseRequisition);

export default router;
