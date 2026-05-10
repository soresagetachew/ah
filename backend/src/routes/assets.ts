import { Router } from 'express';
import { getAssets, createAsset, updateAsset, deleteAsset } from '../controllers/assetController';
import { authenticate } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/', getAssets);
router.post('/', auditLog('create', 'Asset'), createAsset);
router.put('/:id', auditLog('update', 'Asset'), updateAsset);
router.delete('/:id', auditLog('delete', 'Asset'), deleteAsset);

export default router;
