import { Router } from 'express';
import { getAssets, createAsset, updateAsset, deleteAsset } from '../controllers/assetController';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/', checkPermission('assets.view'), getAssets);
router.post('/', checkPermission('assets.create'), auditLog('create', 'Asset'), createAsset);
router.put('/:id', checkPermission('assets.edit'), auditLog('update', 'Asset'), updateAsset);
router.delete('/:id', checkPermission('assets.delete'), auditLog('delete', 'Asset'), deleteAsset);

export default router;
