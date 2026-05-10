CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
CREATE TYPE user_role AS ENUM ('System Admin', 'GM', 'Finance', 'Storekeeper', 'Checker', 'Staff', 'Auditor');
CREATE TYPE business_unit_type AS ENUM ('HO', 'Directorate', 'Construction', 'Kodeko', 'School', 'Ocean', 'Eucalyptus');
CREATE TYPE pr_status AS ENUM ('draft', 'submitted', 'under review', 'approved', 'rejected', 'returned');
CREATE TYPE grn_status AS ENUM ('draft', 'completed');
CREATE TYPE siv_status AS ENUM ('draft', 'issued', 'received');
CREATE TYPE payment_mode AS ENUM ('cash', 'cheque');
CREATE TYPE prf_status AS ENUM ('draft', 'submitted', 'checked', 'authorized', 'disbursed', 'rejected', 'returned');
CREATE TYPE action_type AS ENUM ('approve', 'reject', 'return', 'check');

-- TABLES

-- 2. departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    business_unit business_unit_type NOT NULL,
    parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    business_unit business_unit_type,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    budget DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tin_number VARCHAR(50) UNIQUE,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. purchase_requisitions
CREATE TABLE purchase_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_no VARCHAR(50) UNIQUE NOT NULL,
    requester_id UUID NOT NULL REFERENCES users(id),
    department_id UUID NOT NULL REFERENCES departments(id),
    project_id UUID REFERENCES projects(id),
    reason TEXT NOT NULL,
    status pr_status DEFAULT 'draft',
    total_requested DECIMAL(15, 2) DEFAULT 0.00,
    total_approved DECIMAL(15, 2) DEFAULT 0.00,
    cheque_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 6. pr_line_items
CREATE TABLE pr_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID NOT NULL REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    requested_amount DECIMAL(15, 2) NOT NULL,
    approved_amount DECIMAL(15, 2),
    actual_disbursement DECIMAL(15, 2),
    remaining_amount DECIMAL(15, 2)
);

-- 7. goods_receiving_notes
CREATE TABLE goods_receiving_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_no VARCHAR(50) UNIQUE NOT NULL,
    pr_id UUID NOT NULL REFERENCES purchase_requisitions(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    invoice_no VARCHAR(100),
    invoice_attachment VARCHAR(255),
    type_classification VARCHAR(100),
    status grn_status DEFAULT 'draft',
    received_by UUID NOT NULL REFERENCES users(id),
    transferred_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. grn_line_items
CREATE TABLE grn_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_id UUID NOT NULL REFERENCES goods_receiving_notes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity_received DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(15, 2) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    remarks TEXT
);

-- 9. store_issued_vouchers
CREATE TABLE store_issued_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_no VARCHAR(50) UNIQUE NOT NULL,
    grn_id UUID NOT NULL REFERENCES goods_receiving_notes(id),
    issued_to_id UUID NOT NULL REFERENCES users(id),
    cost_center VARCHAR(100),
    status siv_status DEFAULT 'draft',
    issued_by UUID NOT NULL REFERENCES users(id),
    received_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. siv_line_items
CREATE TABLE siv_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siv_id UUID NOT NULL REFERENCES store_issued_vouchers(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    qty_issued DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(15, 2) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    remarks TEXT
);

-- 11. payment_requests
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_no VARCHAR(50) UNIQUE NOT NULL,
    pr_id UUID REFERENCES purchase_requisitions(id),
    requester_id UUID NOT NULL REFERENCES users(id),
    department_id UUID NOT NULL REFERENCES departments(id),
    mode payment_mode NOT NULL,
    amount_figure DECIMAL(15, 2) NOT NULL,
    amount_words TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status prf_status DEFAULT 'draft',
    business_unit business_unit_type,
    project_site VARCHAR(255),
    id_no VARCHAR(100),
    linked_grn_id UUID REFERENCES goods_receiving_notes(id),
    account_checked_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    budget_approved_by UUID REFERENCES users(id),
    disbursement_date TIMESTAMP WITH TIME ZONE,
    cheque_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. approval_actions
CREATE TABLE approval_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL,
    document_id UUID NOT NULL,
    actor_id UUID NOT NULL REFERENCES users(id),
    action action_type NOT NULL,
    comment TEXT,
    acted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    document_type VARCHAR(50),
    document_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_purchase_requisitions_status ON purchase_requisitions(status);
CREATE INDEX idx_purchase_requisitions_requester ON purchase_requisitions(requester_id);
CREATE INDEX idx_pr_line_items_pr_id ON pr_line_items(pr_id);
CREATE INDEX idx_goods_receiving_notes_status ON goods_receiving_notes(status);
CREATE INDEX idx_store_issued_vouchers_status ON store_issued_vouchers(status);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_approval_actions_document ON approval_actions(document_type, document_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
