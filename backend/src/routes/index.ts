import { Router } from 'express';
import assetRoutes from './assets';


import authRoutes from './auth';
import userRoutes from './users';

const router = Router();

// Define route groups
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
import departmentRoutes from './departments';

router.use('/departments', departmentRoutes);
// router.use('/projects', projectRoutes);
import supplierRoutes from './suppliers';

router.use('/suppliers', supplierRoutes);
import prRoutes from './purchaseRequisitions';
import grnRoutes from './goodsReceivingNotes';
import sivRoutes from './storeIssuedVouchers';
import prfRoutes from './paymentRequests';

router.use('/purchase-requisitions', prRoutes);
router.use('/goods-receiving-notes', grnRoutes);
router.use('/store-issued-vouchers', sivRoutes);
router.use('/payment-requests', prfRoutes);
import approvalRoutes from './approvals';
import notificationRoutes from './notifications';
import reportRoutes from './reports';
import dashboardRoutes from './dashboard';

router.use('/approvals', approvalRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/assets', assetRoutes);

// router.use('/audit-logs', auditLogRoutes);

export default router;
