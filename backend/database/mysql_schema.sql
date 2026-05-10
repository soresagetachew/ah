CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id VARCHAR(36) REFERENCES departments(id),
    budget DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('System Admin', 'Staff', 'Checker', 'Storekeeper', 'Finance', 'Authorized Signatory', 'GM') NOT NULL,
    department_id VARCHAR(36) REFERENCES departments(id),
    business_unit VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS purchase_requisitions (
    id VARCHAR(36) PRIMARY KEY,
    serial_no VARCHAR(50) UNIQUE NOT NULL,
    requester_id VARCHAR(36) REFERENCES users(id),
    department_id VARCHAR(36) REFERENCES departments(id),
    project_id VARCHAR(36) REFERENCES projects(id),
    reason TEXT NOT NULL,
    cheque_no VARCHAR(50),
    total_requested DECIMAL(15, 2) NOT NULL,
    status ENUM('draft', 'submitted', 'under review', 'approved', 'rejected', 'returned') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS pr_line_items (
    id VARCHAR(36) PRIMARY KEY,
    pr_id VARCHAR(36) REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    requested_amount DECIMAL(15, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tin_number VARCHAR(50) UNIQUE NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goods_receiving_notes (
    id VARCHAR(36) PRIMARY KEY,
    serial_no VARCHAR(50) UNIQUE NOT NULL,
    pr_id VARCHAR(36) REFERENCES purchase_requisitions(id),
    supplier_id VARCHAR(36) REFERENCES suppliers(id),
    invoice_no VARCHAR(100),
    type_classification ENUM('consumable', 'fixed_asset', 'service') NOT NULL,
    status ENUM('draft', 'completed') DEFAULT 'draft',
    received_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grn_line_items (
    id VARCHAR(36) PRIMARY KEY,
    grn_id VARCHAR(36) REFERENCES goods_receiving_notes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity_received DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(15, 2) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS store_issued_vouchers (
    id VARCHAR(36) PRIMARY KEY,
    serial_no VARCHAR(50) UNIQUE NOT NULL,
    grn_id VARCHAR(36) REFERENCES goods_receiving_notes(id),
    issued_to_id VARCHAR(36) REFERENCES users(id),
    cost_center VARCHAR(100),
    status ENUM('draft', 'issued') DEFAULT 'draft',
    issued_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS siv_line_items (
    id VARCHAR(36) PRIMARY KEY,
    siv_id VARCHAR(36) REFERENCES store_issued_vouchers(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    qty_issued DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(15, 2) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS payment_requests (
    id VARCHAR(36) PRIMARY KEY,
    serial_no VARCHAR(50) UNIQUE NOT NULL,
    pr_id VARCHAR(36) REFERENCES purchase_requisitions(id),
    requester_id VARCHAR(36) REFERENCES users(id),
    department_id VARCHAR(36) REFERENCES departments(id),
    business_unit VARCHAR(100),
    project_site VARCHAR(255),
    id_no VARCHAR(50),
    mode ENUM('cash', 'cheque') NOT NULL,
    amount_figure DECIMAL(15, 2) NOT NULL,
    amount_words TEXT NOT NULL,
    purpose TEXT NOT NULL,
    linked_grn_id VARCHAR(36) REFERENCES goods_receiving_notes(id),
    status ENUM('draft', 'submitted', 'checked', 'authorized', 'disbursed', 'rejected', 'returned') DEFAULT 'draft',
    account_checked_by VARCHAR(36) REFERENCES users(id),
    approved_by VARCHAR(36) REFERENCES users(id),
    budget_approved_by VARCHAR(36) REFERENCES users(id),
    cheque_number VARCHAR(100),
    disbursement_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_actions (
    id VARCHAR(36) PRIMARY KEY,
    document_type ENUM('PR', 'GRN', 'SIV', 'PRF') NOT NULL,
    document_id VARCHAR(36) NOT NULL,
    actor_id VARCHAR(36) REFERENCES users(id),
    action ENUM('approve', 'reject', 'return') NOT NULL,
    comment TEXT,
    acted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    document_type ENUM('PR', 'GRN', 'SIV', 'PRF'),
    document_id VARCHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(36),
    changes JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(36) PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    current_stock DECIMAL(10, 2) DEFAULT 0.00,
    minimum_stock DECIMAL(10, 2) DEFAULT 0.00,
    cost_center VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id VARCHAR(36) PRIMARY KEY,
    item_id VARCHAR(36) REFERENCES inventory_items(id),
    movement_type ENUM('IN', 'OUT') NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(36) NOT NULL,
    actor_id VARCHAR(36) REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
