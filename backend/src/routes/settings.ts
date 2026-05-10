import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { auditLog } from '../middleware/audit';
import { 
  getSettings, 
  updateSetting, 
  bulkUpdateSettings, 
  getSettingByKey,
  getPublicSettings,
  getAuditLogs,
  uploadLogo,
  getUsers,
  createUser,
  updateUser,
  getRolePermissions,
  updateRolePermissions,
  getApprovalRules,
  getAmountThresholds,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getProjects,
  createProject,
  getBudgetSummary,
  getSecurityPolicy,
  getActiveSessions,
  terminateSession,
  terminateUserSessions,
  getSecurityEvents,
  getLockedAccounts,
  unlockUserAccount,
  getDocumentConfig,
  updateDocumentSequence,
  resetDocumentSerial,
  getPdfPreview,
  getNotificationRules,
  updateNotificationRule,
  getNotificationTemplates,
  updateNotificationTemplates,
  testSmtp,
  testSms,
  getAuditLogList,
  getAuditLogStats,
  exportAuditLogs,
  getSystemHealth,
  getSystemStats,
  getRecentErrors,
  purgeAuditLogs,
  resetAllSerials,
  exportAllData,
  wipeTestData
} from '../controllers/settingsController';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/logos/',
  filename: (req, file, cb) => {
    cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

const router = Router();

router.use(authenticate);

router.get('/public', getPublicSettings);

router.use(authorize(['System Admin']));

// System Settings
router.get('/', getSettings);
router.get('/audit', getAuditLogs);
router.post('/logo', upload.single('logo'), uploadLogo);
router.put('/', auditLog('update_setting', 'system'), updateSetting);
router.put('/bulk', auditLog('bulk_update_settings', 'system'), bulkUpdateSettings);
// Users & Roles
router.get('/users/all', getUsers);
router.post('/users', auditLog('create_user', 'user'), createUser);
router.put('/users/:id', auditLog('update_user', 'user'), updateUser);
router.get('/roles/permissions', getRolePermissions);
router.put('/roles/permissions', auditLog('update_permissions', 'role'), updateRolePermissions);

// Org Structure
router.get('/departments', getDepartments);
router.post('/departments', auditLog('create_department', 'org'), createDepartment);
router.put('/departments/:id', auditLog('update_department', 'org'), updateDepartment);
router.delete('/departments/:id', auditLog('delete_department', 'org'), deleteDepartment);
router.get('/projects', getProjects);
router.post('/projects', auditLog('create_project', 'org'), createProject);
router.get('/:key', getSettingByKey);

// Budgeting
router.get('/budgets/summary', getBudgetSummary);

// Workflows
router.get('/workflows/rules', getApprovalRules);
router.get('/workflows/thresholds', getAmountThresholds);

// Security
router.get('/security/policy', getSecurityPolicy);
router.get('/security/sessions', getActiveSessions);
router.delete('/security/sessions/:id', auditLog('terminate_session', 'security'), terminateSession);
router.delete('/security/sessions/user/:userId', auditLog('terminate_user_sessions', 'security'), terminateUserSessions);
router.get('/security/events', getSecurityEvents);
router.get('/security/locked-accounts', getLockedAccounts);
router.post('/security/unlock/:userId', auditLog('unlock_account', 'security'), unlockUserAccount);

// Documents
router.get('/documents/config', getDocumentConfig);
router.put('/documents/sequence', auditLog('update_doc_sequence', 'document'), updateDocumentSequence);
router.post('/documents/reset-serial/:type', auditLog('reset_doc_serial', 'document'), resetDocumentSerial);
router.get('/documents/pdf-preview/:type', getPdfPreview);

// Notifications
router.get('/notifications/rules', getNotificationRules);
router.put('/notifications/rules', auditLog('update_notification_rule', 'notification'), updateNotificationRule);
router.get('/notifications/templates/:eventType', getNotificationTemplates);
router.put('/notifications/templates/:eventType', auditLog('update_template', 'notification'), updateNotificationTemplates);
router.post('/notifications/test-smtp', testSmtp);
router.post('/notifications/test-sms', testSms);

// Audit & Health
router.get('/audit-logs/list', getAuditLogList);
router.get('/audit-logs/stats', getAuditLogStats);
router.get('/audit-logs/export', auditLog('export_audit', 'system'), exportAuditLogs);
router.get('/system/health', getSystemHealth);
router.get('/system/stats', getSystemStats);
router.get('/system/errors', getRecentErrors);

// Danger Zone (Double logged with high severity)
router.post('/danger/purge-audit-logs', auditLog('danger_purge_logs', 'system'), purgeAuditLogs);
router.post('/danger/reset-all-serials', auditLog('danger_reset_serials', 'system'), resetAllSerials);
router.post('/danger/export-all-data', auditLog('danger_export_data', 'system'), exportAllData);
router.post('/danger/wipe-test-data', auditLog('danger_wipe_test', 'system'), wipeTestData);

export default router;
