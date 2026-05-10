export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'System Admin' | 'GM' | 'Finance' | 'Storekeeper' | 'Checker' | 'Staff' | 'Auditor';
  department_id: string;
  department_name?: string;
  business_unit: 'HO' | 'Directorate' | 'Construction' | 'Kodeko' | 'School' | 'Ocean' | 'Eucalyptus';
  is_active: boolean;
  theme_mode?: 'light' | 'dark' | 'system';
  theme_dark_mode_enabled?: boolean;
  created_at?: string;
}

export interface PurchaseRequisition {
  id: string;
  serialNo: string;
  requesterId: string;
  departmentId: string;
  projectId?: string;
  reason: string;
  status: 'draft' | 'submitted' | 'under review' | 'approved' | 'rejected' | 'returned';
  totalRequested: number;
  totalApproved: number;
  createdAt: string;
}

export interface PRLineItem {
  id: string;
  prId: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  requestedAmount: number;
  approvedAmount?: number;
}

export interface GoodsReceivingNote {
  id: string;
  serialNo: string;
  prId: string;
  supplierId: string;
  status: 'draft' | 'completed';
}

export interface GRNLineItem {
  id: string;
  grnId: string;
  description: string;
  quantityReceived: number;
  unitCost: number;
}

export interface StoreIssuedVoucher {
  id: string;
  serialNo: string;
  grnId: string;
  issuedToId: string;
  status: 'draft' | 'issued' | 'received';
}

export interface SIVLineItem {
  id: string;
  sivId: string;
  description: string;
  qtyIssued: number;
  unitCost: number;
}

export interface PaymentRequest {
  id: string;
  serialNo: string;
  requesterId: string;
  amountFigure: number;
  amountWords: string;
  purpose: string;
  status: 'draft' | 'submitted' | 'checked' | 'authorized' | 'disbursed' | 'rejected' | 'returned';
}

export interface ApprovalAction {
  id: string;
  documentType: string;
  documentId: string;
  actorId: string;
  action: 'approve' | 'reject' | 'return' | 'check';
  comment?: string;
  actedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
}

export interface AuditLog {
  id: string;
  entityType: string;
  action: string;
  timestamp: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  description?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  department_id?: string;
  department_name?: string;
  status: 'active' | 'maintenance' | 'retired';
  created_at: string;
}
