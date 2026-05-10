# African Holding Group — Procurement Web App
## Complete Step-by-Step IDE Build Guide

> **How to use this file:**
> Open this file in your IDE (Cursor, VS Code + Copilot, Windsurf, etc.).
> Follow each step in order. Copy the prompt block and paste it into your AI assistant.
> Do NOT skip steps — each one builds on the previous.
> Complete one step fully before moving to the next.

---

## Project Overview

You are building a full-stack web application for **African Holding Share Company** (Ethiopia).
The app digitizes their paper-based procurement and payment workflow.

**Four core documents:**
1. Purchase Requisition (PR) — staff request items/services
2. Goods Receiving Note (GRN) — storekeeper confirms receipt from supplier
3. Store Issued Voucher (SIV) — storekeeper issues items from stock to a department
4. Payment Request Form (PRF) — finance processes payment after goods received

**Business units:** HO, Directorate, Construction/Real Estate, Kodeko, School, Ocean, Eucalyptus

**User roles:** System Admin, General Manager (GM), Finance/Disbursement, Storekeeper, Checker/Supervisor, Staff/Requester, Auditor

**Tech stack:** React + TypeScript, Node.js + Express, PostgreSQL, JWT auth, Tailwind CSS

---

## PHASE 1 — Project Setup & Architecture

---

### STEP 1.1 — Give the AI the full project context

> Paste this prompt first in every new AI session to ground it in the project.

```
I want to build a full-stack web application for African Holding Share Company,
a multi-subsidiary company in Ethiopia. The app digitizes their paper-based
procurement and payment workflow.

The app must handle 4 core documents:
1. Purchase Requisition (PR) — staff request items/services
2. Goods Receiving Note (GRN) — storekeeper confirms receipt from supplier
3. Store Issued Voucher (SIV) — storekeeper issues items from stock to a department
4. Payment Request Form (PRF) — finance processes payment after goods received

Business units: HO, Directorate, Construction/Real Estate, Kodeko, School, Ocean, Eucalyptus

User roles: System Admin, General Manager (GM), Finance/Disbursement, Storekeeper,
Checker/Supervisor, Staff/Requester, Auditor

Key requirements:
- Sequential approval workflow (Submit → Check → GM Approve)
- Each document auto-links to the next (PR → GRN → SIV → PRF)
- Real-time notifications on status changes
- Full audit trail with timestamps and user actions
- Role-based access control (RBAC)
- Bilingual support (English + Amharic)
- Mobile responsive / PWA
- PDF export of any document

Tech stack: React + TypeScript (frontend), Node.js + Express (backend),
PostgreSQL (database), JWT auth, Tailwind CSS for styling.

Please confirm you understand this project and then suggest the complete
folder structure for both frontend and backend.
```

---

### STEP 1.2 — Generate the complete database schema

```
Now generate the complete PostgreSQL database schema for this project.
Create a single SQL file with ALL tables.

Required tables:
1. users (id, full_name, email, password_hash, role ENUM, department_id FK,
   business_unit, is_active, created_at)
2. departments (id, name, code, business_unit ENUM['HO','Directorate',
   'Construction','Kodeko','School','Ocean','Eucalyptus'], parent_id FK)
3. projects (id, name, code, department_id FK, budget DECIMAL, is_active)
4. suppliers (id, name, tin_number, contact_person, phone, email, address)
5. purchase_requisitions (id, serial_no, requester_id FK, department_id FK,
   project_id FK, reason, status ENUM, total_requested, total_approved,
   cheque_no, created_at)
6. pr_line_items (id, pr_id FK, description, unit, quantity, unit_price,
   requested_amount, approved_amount, actual_disbursement, remaining_amount)
7. goods_receiving_notes (id, serial_no, pr_id FK, supplier_id FK, invoice_no,
   type_classification, status, received_by FK, transferred_by FK, created_at)
8. grn_line_items (id, grn_id FK, description, unit, quantity_received,
   unit_cost, total_cost, remarks)
9. store_issued_vouchers (id, serial_no, grn_id FK, issued_to_id FK,
   cost_center, status, issued_by FK, received_by FK, created_at)
10. siv_line_items (id, siv_id FK, description, unit, qty_issued,
    unit_cost, total_cost, remarks)
11. payment_requests (id, serial_no, pr_id FK, requester_id FK,
    department_id FK, mode ENUM['cash','cheque'], amount_figure DECIMAL,
    amount_words TEXT, purpose TEXT, status ENUM, created_at)
12. approval_actions (id, document_type, document_id UUID, actor_id FK,
    action ENUM['approve','reject','return','check'], comment TEXT, acted_at)
13. notifications (id, user_id FK, title, message, is_read, document_type,
    document_id, created_at)
14. audit_logs (id, user_id FK, entity_type, entity_id, action,
    old_values JSONB, new_values JSONB, ip_address, timestamp)

Include: all foreign key constraints, indexes on foreign keys and status columns,
ENUM types, timestamps with timezone, UUID primary keys using gen_random_uuid().
```

---

### STEP 1.3 — Generate the backend scaffold

```
Generate the complete Node.js + Express + TypeScript backend scaffold. Include:

1. package.json with all dependencies:
   express, typescript, pg, bcryptjs, jsonwebtoken, cors, dotenv,
   express-validator, multer (for file uploads), nodemailer, uuid

2. src/index.ts — main server entry point with middleware
   (cors, json, error handler)

3. src/config/database.ts — PostgreSQL connection pool using pg

4. src/middleware/auth.ts — JWT verification middleware
   src/middleware/rbac.ts — Role checking middleware
   (checkRole('GM'), checkRole('Finance'), etc.)
   src/middleware/audit.ts — Automatic audit logging middleware

5. src/routes/index.ts — Route aggregator with these route groups:
   - /api/auth (login, logout, me)
   - /api/users (CRUD)
   - /api/departments
   - /api/projects
   - /api/suppliers
   - /api/purchase-requisitions
   - /api/goods-receiving-notes
   - /api/store-issued-vouchers
   - /api/payment-requests
   - /api/approvals
   - /api/notifications
   - /api/reports
   - /api/audit-logs

6. src/utils/serialNumber.ts — function to generate serial numbers like
   PR-2025-0001, GRN-2025-0001

7. src/utils/amountToWords.ts — converts numeric amount to Ethiopian Birr words
   e.g. "Five Thousand Birr Only"

8. .env.example with all required environment variables

Use async/await throughout, proper error handling, and TypeScript interfaces
for all data types.
```

---

### STEP 1.4 — Generate the React frontend scaffold

```
Generate the complete React + TypeScript frontend scaffold using Vite. Include:

1. package.json with dependencies:
   react, react-dom, react-router-dom, typescript, tailwindcss, axios,
   react-hook-form, zustand, react-query (@tanstack/react-query),
   recharts, react-i18next, lucide-react, react-hot-toast

2. vite.config.ts — with path aliases (@/ → src/)

3. tailwind.config.ts — with custom colors:
   primary: '#1a1a2e' (deep navy), secondary colors for status badges

4. src/main.tsx — app entry point with providers:
   QueryClientProvider, Router, AuthProvider, Toaster

5. src/App.tsx — route definitions:
   - /login → LoginPage (public)
   - / → Dashboard (protected, role-specific)
   - /purchase-requisitions → PR List
   - /purchase-requisitions/new → Create PR
   - /purchase-requisitions/:id → PR Detail
   - /goods-receiving-notes → GRN List
   - /goods-receiving-notes/new → Create GRN
   - /store-issued-vouchers → SIV List
   - /payment-requests → Payment Request List
   - /payment-requests/new → Create Payment Request
   - /approvals → Approval Inbox
   - /reports → Reports
   - /admin/users → User Management (Admin only)
   - /inventory → Inventory (Storekeeper only)

6. src/types/index.ts — TypeScript interfaces for:
   User, PurchaseRequisition, PRLineItem, GoodsReceivingNote, GRNLineItem,
   StoreIssuedVoucher, SIVLineItem, PaymentRequest, ApprovalAction,
   Notification, AuditLog

7. src/api/client.ts — Axios instance with JWT header injection and
   auto-redirect on 401
```

---

## PHASE 2 — Authentication & User Management

---

### STEP 2.1 — Build the auth API endpoints

```
Build the complete authentication system for the African Holding procurement app.

Create these files:

src/controllers/authController.ts with:
- POST /auth/login: validate email+password, compare bcrypt hash, return JWT
  token (24h expiry) + user object (exclude password). Include user's role,
  department, and permissions array.
- GET /auth/me: return current user profile from JWT
- POST /auth/logout: blacklist token (use a Set in memory for now)
- POST /auth/change-password: validate old password, hash new one

src/controllers/userController.ts with:
- GET /users: paginated list with filter by role, department, is_active
- POST /users: create user (admin only), auto-generate temp password,
  send welcome email
- PUT /users/:id: update user details
- PATCH /users/:id/toggle-active: enable/disable user
- POST /users/:id/delegate: temporarily delegate approval power to another
  user with an expiry date

Include:
- Input validation with express-validator on all endpoints
- Proper HTTP status codes (400, 401, 403, 404, 500)
- Permission checks: only Admin can create/manage users
- Auto-write to audit_logs on every mutation
- TypeScript interfaces for User, LoginRequest, LoginResponse
```

---

### STEP 2.2 — Build the login page and auth flow

```
Build the complete React + TypeScript authentication frontend for the
African Holding procurement app.

Create these files:

1. src/store/authStore.ts — Zustand store with:
   user, token, isAuthenticated, login(), logout(), refreshUser()

2. src/api/authApi.ts — Axios instance with: base URL from env, JWT token
   injected in headers, auto-redirect to /login on 401 response

3. src/pages/LoginPage.tsx:
   - African Holding logo (text logo with globe icon for now)
   - Clean centered card with email + password fields
   - "Remember me" checkbox
   - Show/hide password toggle
   - Loading state on submit button
   - Error message display
   - Responsive: works on mobile

4. src/components/ProtectedRoute.tsx — redirects to /login if not
   authenticated, redirects to /unauthorized if wrong role

5. src/components/layout/AppLayout.tsx:
   - Left sidebar with navigation links filtered by user role
   - Top header with: page title, notification bell (with unread count badge),
     user avatar + dropdown (profile, change password, logout)
   - Mobile: hamburger menu, slide-out drawer
   - Role-specific nav items: Staff sees only their forms,
     GM sees everything, Storekeeper sees inventory pages

Use Tailwind CSS. Color scheme: deep navy (#1a1a2e) for sidebar,
white content area. Include TypeScript types for all components and props.
```

---

### STEP 2.3 — Build the user management page

```
Build the User Management page for the System Admin role.

Create src/pages/admin/UsersPage.tsx with:
- Table: avatar+name, email, role badge (color-coded), department,
  status (active/inactive toggle), actions
- Search bar to filter by name or email
- Filter dropdowns: by role, by department, by status
- "Add User" button opens a modal/drawer with full user creation form
- Each row: Edit button opens edit drawer, Deactivate/Activate toggle

Create src/components/users/UserFormDrawer.tsx:
- Slide-in drawer from the right
- Fields: Full Name, Email, Role (select), Department (select),
  Business Unit (select), Phone
- Role selector: Admin, GM, Finance, Storekeeper, Checker, Staff, Auditor
- On save: POST /api/users, show success toast, refresh table

Create src/components/users/RoleBadge.tsx:
- Color-coded badges per role:
  Admin=red, GM=amber, Finance=purple, Storekeeper=teal,
  Checker=blue, Staff=gray, Auditor=dark

Include pagination, loading skeletons while fetching, and empty state
when no users found. Use Tailwind CSS throughout.
```

---

## PHASE 3 — Purchase Requisition Form

---

### STEP 3.1 — Build the PR backend controller

```
Build the complete Purchase Requisition (PR) backend for the African Holding app.

Create src/controllers/purchaseRequisitionController.ts:

GET /purchase-requisitions
- Paginated list (20 per page)
- Filter by: status, department_id, project_id, requester_id, date range
- Staff sees only their own; Checker sees dept PRs; GM/Admin see all
- Include requester name, department name, project name in response
- Sort by created_at DESC

POST /purchase-requisitions
- Validate: reason required, at least 1 line item, each item needs
  description + unit + qty + unit_price
- Auto-generate serial number: PR-YYYY-NNNN (sequential, padded)
- Set status = 'draft'
- Calculate total_requested from line items
- Insert PR + all line items in a database transaction
- Create notification for Checker of the requester's department

GET /purchase-requisitions/:id
- Return full PR with all line items, approval history, requester profile

PUT /purchase-requisitions/:id
- Only allowed if status = 'draft' or 'returned'
- Requester can only edit their own PR
- Recalculate totals on save

POST /purchase-requisitions/:id/submit
- Change status from 'draft' to 'submitted'
- Notify checker via notification + email

DELETE /purchase-requisitions/:id
- Soft delete only (set deleted_at timestamp)
- Only draft PRs can be deleted by the requester or admin

Include full TypeScript types, error handling, and audit logging on all mutations.
```

---

### STEP 3.2 — Build the PR form UI

```
Build the Purchase Requisition form page for the African Holding procurement app.

Create src/pages/pr/CreatePRPage.tsx with:

FORM HEADER SECTION:
- Auto-generated PR number shown as read-only badge (e.g., PR-2025-0001)
- Date (today, read-only)
- Requested By: current user name (read-only, auto-filled)
- Project: searchable dropdown (fetched from /api/projects)
- Department: auto-filled from user's department, read-only
- Reason for Purchase: textarea with 500 char counter
- Cheque No: text input (optional)

DYNAMIC LINE ITEMS TABLE:
- Columns: #, Description, Unit, Qty, Unit Price (ETB), Amount, Action
- "Add Item" button adds a new empty row
- Each row: description (text), unit (select: Pcs/Box/Kg/Ltr/Set/Other),
  qty (number), unit_price (number formatted with commas)
- Amount column: auto-calculates qty × unit_price, formatted as "ETB 1,250.00"
- Delete icon on each row (disabled if only 1 row remains)
- TOTAL row at the bottom showing sum of all amounts in bold

FORM FOOTER:
- "Save as Draft" button (gray)
- "Submit for Approval" button (blue) with confirmation dialog
- Cancel button

VALIDATION:
- Highlight empty required fields in red on submit attempt
- Show inline error messages
- Warn if total exceeds a configurable budget threshold

Use React Hook Form for form state. The form should look clean and professional,
resembling the original paper form but modernized.
Include loading states on all async actions. Use Tailwind CSS.
```

---

### STEP 3.3 — Build the PR list and detail pages

```
Build the Purchase Requisition list page and detail view.

Create src/pages/pr/PRListPage.tsx:
- Table columns: PR Number, Project, Requested By, Department,
  Total Amount, Status Badge, Date, Actions
- Status badges: Draft=gray, Submitted=blue, Under Review=amber,
  Approved=green, Rejected=red, Returned=orange
- Search by PR number or description
- Filter by status, department, date range
- Each row clickable → goes to detail page
- "New PR" button top-right
- Pagination at bottom

Create src/pages/pr/PRDetailPage.tsx:
- Header: PR number + status badge + action buttons
  (Edit if draft, Submit if draft, Print PDF)
- Info grid: Project, Department, Requested By, Date, Reason
- Line items table (read-only)
- Total summary box (right-aligned): Requested Total, Approved Total,
  Remaining
- APPROVAL TIMELINE at the bottom:
  Vertical stepper: Submitted (date+user) → Checked (date+user+comment)
  → GM Approved (date+user)
  Each step shows circle with checkmark/clock/X, actor name, date, comment
  Pending steps shown as gray with clock icon
- Comment thread: approvers' notes shown chronologically
- "Return to Requester" creates a comment prompt before returning

Use Tailwind CSS. Include loading skeleton states. Mobile responsive.
```

---

## PHASE 4 — Approval Workflow Engine

---

### STEP 4.1 — Build the universal approval service

```
Build a universal Approval Workflow Engine for the African Holding app.

Create src/services/approvalService.ts:

This service handles approvals for ALL document types (PR, GRN, SIV, PRF).

WORKFLOW RULES:
- Purchase Requisition: Staff → Checker (dept supervisor) → GM
- Payment Request: Requester → Checker → Finance → Authorized Signatory
- GRN: Storekeeper → Finance (auto-notify)
- SIV: Storekeeper issues → Receiver confirms

Functions:

1. submitForApproval(documentType, documentId, actorId)
   - Validates actor is the document owner
   - Changes status to 'submitted'
   - Finds next approver based on doc type and actor's department
   - Creates notification for next approver

2. approve(documentType, documentId, actorId, comment?)
   - Validates actor has permission for this approval step
   - Records approval_action with timestamp
   - Checks if more approvals needed; if final step → status = 'approved'
   - Notifies requester of approval
   - If PR approved → auto-notify storekeeper to prepare GRN

3. reject(documentType, documentId, actorId, comment)
   - Comment is REQUIRED for rejection
   - Sets status = 'rejected'
   - Notifies requester with the rejection reason

4. returnForRevision(documentType, documentId, actorId, comment)
   - Comment is REQUIRED
   - Sets status = 'returned'
   - Requester can edit and resubmit

5. getApprovalStatus(documentType, documentId)
   - Returns full approval history with actors, timestamps, comments
   - Returns next required approver info

6. checkPermission(actorId, documentType, documentId)
   - Returns true/false if actor can approve this document at this stage

Create API routes in src/routes/approvals.ts.
Include all TypeScript types and proper error messages.
```

---

### STEP 4.2 — Build the notifications system

```
Build the notification system for the African Holding app.

Backend — src/services/notificationService.ts:
- createNotification(userId, title, message, documentType, documentId)
- markAsRead(notificationId, userId)
- markAllAsRead(userId)
- getUnreadCount(userId)
- getUserNotifications(userId, page): paginated, newest first

Backend — src/routes/notifications.ts:
- GET /notifications — paginated list for current user
- PATCH /notifications/:id/read — mark single as read
- PATCH /notifications/read-all — mark all as read
- GET /notifications/unread-count — returns just the number

Server-Sent Events (SSE) for real-time updates:
- GET /notifications/stream — keeps connection open,
  pushes new count when a notification is created for that user

Email notifications — src/services/emailService.ts:
- sendApprovalRequest(toEmail, docType, docNumber, requesterName, link)
- sendApprovalResult(toEmail, docType, docNumber, status, comment, link)
- sendStatusUpdate(toEmail, message, link)
- Use nodemailer with SMTP; HTML email template with African Holding branding

Frontend — src/components/NotificationPanel.tsx:
- Bell icon in header with red badge showing unread count
- Click opens slide-down panel (not a new page)
- List: icon, title, "2 hours ago", unread shown with blue dot
- Clicking a notification navigates to the relevant document
- "Mark all as read" button at top
- Empty state: "No notifications yet"
- Uses SSE to update count in real-time without page refresh
```

---

### STEP 4.3 — Build the approval inbox UI

```
Build the Approval Inbox page for Checkers and GM.

Create src/pages/approvals/ApprovalInboxPage.tsx:

TOP STATS ROW (4 metric cards):
- Pending approvals count
- Approved today count
- Rejected this week count
- Average approval time (in hours)

PENDING APPROVALS TABLE:
- Columns: Document Type badge (PR/GRN/SIV/PRF), Number, Requested By,
  Department, Amount (ETB), Submitted Date, Age, Actions
- Age badge: green if < 1 day, amber if 1-3 days, red if > 3 days
- Row click → preview panel slides in from right with document summary
- Action buttons per row: ✓ Approve, ↩ Return, ✗ Reject
  - Approve: shows confirmation dialog with optional comment textarea
  - Return/Reject: requires comment (validated before submit)

BULK APPROVAL:
- Checkboxes on each row
- "Approve Selected" button appears when any row is checked
- Confirmation dialog: "You are approving X documents
  totaling ETB Y,YYY — Confirm?"

PREVIEW PANEL (src/components/approvals/DocumentPreviewPanel.tsx):
- Slide-in from right, 500px wide
- Shows: doc header info, line items table, approval history timeline
- Approve/Return/Reject buttons at the bottom
- "Open Full Document" link

Use Tailwind CSS. Sortable table column headers.
Include skeleton loading states.
```

---

## PHASE 5 — Store Management (GRN + SIV)

---

### STEP 5.1 — Build the Goods Receiving Note module

```
Build the Goods Receiving Note (GRN) module for the African Holding app.

Backend — src/controllers/grnController.ts:

POST /goods-receiving-notes
- Storekeeper creates GRN linked to an approved PR
- Fields: pr_id FK, supplier_id, invoice_no, invoice_attachment (file upload),
  type_classification, line items with qty_received and unit_cost
- Auto-generate serial: GRN-YYYY-NNNN
- 3-WAY MATCH VALIDATION: compare received quantities to PR quantities;
  flag discrepancies > 5% as warnings (not blocking)
- On save: update inventory stock levels (add received quantities)
- Notify Finance that GRN is ready for payment processing
- Notify the original PR requester that goods have arrived

GET /goods-receiving-notes — list with filters
  (status, supplier, date range, linked pr_id)
GET /goods-receiving-notes/:id — full detail with linked PR, supplier,
  line items

Frontend — src/pages/grn/CreateGRNPage.tsx:
- "Linked PR" selector: searchable dropdown of approved PRs with no GRN yet
- Supplier selector linked to suppliers master list
- Invoice number input + file upload button for invoice PDF/image
- Line items table: pre-filled from PR items, storekeeper edits
  qty_received and unit_cost
- If qty_received differs from PR qty: show amber warning badge
  "Quantity differs from PR"
- Total value auto-calculated
- Submit button: "Record Goods Receipt"

src/pages/grn/GRNDetailPage.tsx:
- Full GRN detail with linked PR summary
- Attached invoice preview (PDF viewer or image)
- 3-way match summary table: PR qty vs GRN qty vs variance %
- Transfer/Receive digital signature section
```

---

### STEP 5.2 — Build Store Issued Voucher and inventory

```
Build the Store Issued Voucher (SIV) and inventory management module.

Add tables:
- inventory_items (id, item_name, unit, current_stock, minimum_stock,
  cost_center, last_updated)
- inventory_movements (id, item_id FK, movement_type ENUM['IN','OUT'],
  quantity, reference_type, reference_id, actor_id, timestamp)

Backend — src/controllers/sivController.ts:

POST /store-issued-vouchers
- Linked to a GRN (items received → now issued to a department)
- Fields: grn_id FK, issued_to_id, cost_center, line items
  (item, qty_issued, unit_cost)
- STOCK VALIDATION: check current_stock ≥ qty_issued; block if insufficient
- On save: deduct stock from inventory_items,
  record inventory_movement type OUT
- Notify issued_to_id that items are ready to collect
- Auto-calculate total_cost

GET /store-issued-vouchers — list with filters
GET /store-issued-vouchers/:id — full detail

Frontend — src/pages/siv/CreateSIVPage.tsx:
- "Issued To" user/department selector
- Cost Center dropdown
- Line items: item description, unit, qty_issued
  (shows available stock next to field in gray text), unit_cost, total
- If qty_issued > available stock: red error "Insufficient stock (available: X)"
- Receiver confirmation: "Received By" digital acknowledgment field

src/pages/inventory/InventoryPage.tsx (Storekeeper view):
- Table: Item Name, Unit, Current Stock, Min Stock, Cost Center, Status
- Status badges: In Stock=green, Low Stock=amber, Out of Stock=red
- Low stock items highlighted at top of table
- Stock movement history tab: all IN/OUT movements with dates and references
- "Export to Excel" button
```

---

## PHASE 6 — Payment Request Form

---

### STEP 6.1 — Build the payment request backend

```
Build the Payment Request Form (PRF) backend for the African Holding app.

Backend — src/controllers/paymentRequestController.ts:

POST /payment-requests
- Fields: pr_id (optional FK), requester_id, department_id,
  business_unit (HO/Directorate/Construction/Kodeko/School/Ocean/Eucalyptus),
  project_site, id_no, mode ENUM('cash','cheque'), amount_figure, purpose,
  linked_grn_id
- Auto-generate amount_words from amount_figure
  (Ethiopian Birr: "Five Thousand Three Hundred Birr and 50/100")
- Budget check: if > 90% of department budget used → flag warning;
  if > 100% → require override comment
- Auto-generate serial: PRF-YYYY-NNNN
- Workflow: Submitted → Checked → Authorized → Finance Disbursement
- Notify checker on submit

GET /payment-requests — list with filters
  (status, department, mode, date range, business_unit)
GET /payment-requests/:id — full detail
PUT /payment-requests/:id — edit if draft/returned

DISBURSEMENT ENDPOINT (Finance role only):
POST /payment-requests/:id/disburse
- Fields: account_checked_by, approved_by, budget_approved_by,
  disbursement_date, cheque_number (if mode=cheque)
- Only callable after all approvals are complete
- Sets status = 'disbursed'
- Creates final audit log entry

GET /payment-requests/budget-summary (Finance and GM only):
- Returns per-department: allocated_budget, total_requested,
  total_disbursed, remaining

Include all TypeScript types, validation, and audit logging.
```

---

### STEP 6.2 — Build the payment request form UI

```
Build the Payment Request Form page for the African Holding app.

Create src/pages/payment/CreatePaymentRequestPage.tsx:

REQUESTER INFO SECTION (card):
- Requested By: current user (read-only, auto-filled)
- Date: today (read-only)
- Business Unit selector:
  Selectable card grid with options:
  HO | Directorate | Construction/Real Estate | Kodeko | School | Ocean | Eucalyptus
  Each card has name + relevant icon
- Team name text input (appears after selecting a unit)
- Project/Site text input

PAYMENT DETAILS SECTION (card):
- ID Number text input
- Mode of Payment:
  Two large toggle buttons: [💵 In Cash] [📝 By Cheque]
  If Cash selected: show Cash Handler name field
  If Cheque selected: show Bank Account number field
- Purpose of Payment: large textarea (250 char limit with counter)
- Amount in Figures: number input with commas, "ETB" prefix
  Below it, live auto-generated text:
  "Amount in Words: Five Thousand Birr Only" (updates as user types)

BUDGET INDICATOR:
- Small progress bar: "Department Budget: ETB 150,000 used of ETB 500,000"
- If payment would exceed budget → amber warning banner

SIGNATURES SECTION:
- Three fields side by side: "Requested By", "Checked By", "Authorized"
  (read-only, populated as approvals happen)
- Divider line then "For Disbursement Section Only" shaded box with:
  Account Checked By, Approved By, Budget Approved By
  (Only visible to Finance role)

BOTTOM ACTIONS:
- Save Draft, Submit for Approval, Cancel

Use React Hook Form. Stack columns on mobile. Tailwind CSS.
```

---

## PHASE 7 — Dashboard & Reports

---

### STEP 7.1 — Build role-specific dashboards

```
Build role-specific dashboard home pages for the African Holding app.

Create src/pages/dashboard/DashboardPage.tsx that renders different
content based on user role:

GM DASHBOARD:
- 4 KPI cards: Total PRs this month, Total Spend (ETB),
  Pending Approvals, Rejected this month
- Bar chart: Monthly spend by department (last 6 months) — use Recharts
- Pie chart: Spend by business unit
- Table: Top 5 pending PRs awaiting GM approval (with quick approve button)
- Alert list: Overdue approvals stuck > 3 days

FINANCE DASHBOARD:
- 4 KPI cards: Pending Payments, Disbursed this month (ETB),
  Budget Utilization %, Overdue Payments
- Budget utilization bars per department
- Recent disbursements table (last 10)
- Payment request queue with priority sorting

STOREKEEPER DASHBOARD:
- 4 KPI cards: Items In Stock, Low Stock Alerts, Pending GRNs, Issued Today
- Low stock items list (red/amber highlighted)
- Recent GRNs and SIVs (last 5 each)
- Stock movement chart (last 30 days IN vs OUT)

STAFF DASHBOARD:
- My Recent Requests table (PR number, status badge, date, amount)
- Status timeline of most recent PR (visual stepper)
- "Quick Actions" buttons: New Purchase Request, New Payment Request

Use Recharts with ResponsiveContainer for all charts.
Use skeleton loaders while data fetches.
Format all money as "ETB X,XXX.XX".
```

---

### STEP 7.2 — Build the reports module and PDF export

```
Build the Reports module and PDF export for the African Holding app.

REPORTS PAGE — src/pages/reports/ReportsPage.tsx:

Sidebar with these report types:
1. Spend by Department — bar chart + table, filterable by date + business unit
2. Budget vs Actual — grouped bar chart per department
3. Approval Cycle Time — average days from submission to approval per doc type
4. Pending Documents Aging — all docs pending > N days (N configurable)
5. Supplier Performance — GRNs by supplier, variance rates
6. Audit Log — searchable table of all system actions

Each report has:
- Date range picker (last 7 days / 30 days / 3 months / custom)
- "Export to CSV" button
- "Export to PDF" button
- Print button

PDF GENERATION — backend:
Create src/services/pdfService.ts using puppeteer:

generatePR(prId): PDF matching original paper form layout with:
  - Company letterhead (African Holding Share Company + phone numbers)
  - All PR fields filled
  - Line items table
  - Approval signatures section: who approved + date + timestamp
  - QR code in corner linking to the digital document URL
  - Footer: "Generated on [date] by [username]"

generateGRN(grnId): same layout for Goods Receiving Note
generateSIV(sivId): same layout for Store Issued Voucher
generatePRF(prfId): same layout for Payment Request Form

Add GET /api/documents/:type/:id/pdf endpoint returning binary PDF
with Content-Type: application/pdf header.

Frontend: "Download PDF" button on every document detail page
calls this endpoint and triggers browser download.
```

---

## PHASE 8 — Security, Polish & Deployment

---

### STEP 8.1 — Add security hardening

```
Add comprehensive security hardening to the African Holding procurement app.

Backend security:

1. Rate limiting (express-rate-limit):
   - /auth/login: max 5 attempts per 15 min per IP;
     lockout after 10 consecutive fails
   - All other API routes: 100 req/min per user
   - Return 429 with "Too many requests, try again in X minutes"

2. Input sanitization:
   - Sanitize all text fields saved to DB
   - Validate all UUIDs before DB query
   - Add helmet.js for security headers
     (CSP, HSTS, X-Frame-Options, etc.)

3. JWT security:
   - Rotate refresh tokens on each use
   - Store token blacklist in PostgreSQL table
   - Detect concurrent sessions; warn user on new device/IP login

4. Document integrity:
   - When a document reaches 'approved' status,
     compute SHA-256 hash of document content
   - Store hash in the document record
   - On PDF generate, verify hash;
     show "Verified ✓" or "Modified ⚠" in PDF header

5. Audit log immutability:
   - Every DB write must go through audit logging middleware
   - Log: user_id, entity_type, entity_id, action, old_values (JSONB),
     new_values (JSONB), ip_address, user_agent, timestamp
   - Apply PostgreSQL row security policy:
     no UPDATE or DELETE allowed on audit_logs table

6. Frontend:
   - All API errors show generic user-facing message
     (never expose stack traces)
   - Session timeout: no activity for 30 min → show modal with 60s
     countdown → auto-logout
   - Confirm dialog before any destructive action (reject, delete)
   - CSP meta tag in index.html

Add all items as middleware or service updates to the existing codebase.
```

---

### STEP 8.2 — Add PWA support and Amharic language

```
Add Progressive Web App (PWA) support and Amharic/English bilingual
interface to the African Holding app.

PWA Setup:
1. Add vite-plugin-pwa to vite.config.ts
2. manifest.json:
   - name: "African Holding Procurement"
   - theme_color: "#1a1a2e"
   - display: "standalone"
3. Service worker caching strategy:
   - Cache all API GET responses for 5 minutes (stale-while-revalidate)
   - Cache all static assets permanently
4. Offline page: when offline show:
   "No internet connection — your draft forms are saved locally"
   with offline indicator in header
5. Install prompt: detect beforeinstallprompt event,
   show subtle "Install App" banner at bottom on mobile

Bilingual with react-i18next:
1. src/i18n/en.json — English translations for ALL UI strings
2. src/i18n/am.json — Amharic translations:
   - Purchase Requisition: "የግዢ ጥያቄ"
   - Goods Receiving Note: "የዕቃ ተቀባይ ማስታወሻ"
   - Store Issued Voucher: "የመደብር ሰነድ"
   - Payment Request: "የክፍያ ጥያቄ"
   - Approved: "ተፈቅዷል"
   - Pending: "በጥበቃ ላይ"
   - Rejected: "ተቀባይነት አላገኘም"
   - Submit: "ያቅርቡ"
   - Department: "ክፍል"
   - Project: "ፕሮጀክት"
   - Save Draft: "ረቂቅ አስቀምጥ"
   - Approve: "ፍቀድ"

3. Language toggle: flag button in top-right header (🇬🇧 EN / 🇪🇹 AM)
4. Persist language choice in localStorage

Also add:
- Global toast notification system
  (success=green, error=red, warning=amber, info=blue)
- 404 Not Found page with "Go Home" button
- 403 Unauthorized page when user accesses wrong role page
- Error boundary component that catches React crashes
  and shows a friendly error message
```

---

### STEP 8.3 — Generate all deployment files

```
Generate all deployment and DevOps configuration for the African Holding app.

Create these files:

1. docker-compose.yml — runs:
   frontend (React), backend (Node), PostgreSQL, Redis, Nginx (reverse proxy)

2. backend/Dockerfile — multi-stage build:
   - builder stage: compile TypeScript
   - runner stage: production Node only (no devDependencies)

3. frontend/Dockerfile — build React app, serve with Nginx

4. nginx/nginx.conf — reverse proxy config:
   - / → frontend container
   - /api → backend container
   - gzip compression enabled
   - security headers
   - HTTPS redirect

5. .github/workflows/deploy.yml — CI/CD pipeline:
   On push to main:
   - Run tests
   - Build Docker images
   - Push to Docker Hub
   - SSH to server and run docker-compose up -d

6. scripts/seed.ts — database seeder creating:
   - 1 Admin user (admin@africanholding.com / Admin@123)
   - 1 GM user (gm@africanholding.com)
   - 1 Finance user
   - 1 Storekeeper user
   - 2 Checker users (different departments)
   - 5 Staff users
   - Sample departments: Finance, Procurement, Construction, Store
   - 3 sample projects with budgets
   - 2 sample suppliers

7. scripts/backup.sh — daily PostgreSQL backup script,
   keeps last 30 days of backups

8. README.md — full setup guide:
   - Prerequisites
   - Local development setup (step by step)
   - Environment variables explained
   - How to run migrations
   - How to seed demo data
   - Deployment to production instructions

Use production settings: NODE_ENV=production, disable debug logs,
enable compression, trust proxy for Nginx.
```

---

### STEP 8.4 — Final QA and integration testing

```
Add a complete test suite and QA checklist for the African Holding app.

Create backend tests using Jest + Supertest:

1. src/tests/auth.test.ts:
   - Test login with valid credentials → returns JWT
   - Test login with wrong password → returns 401
   - Test accessing protected route without token → returns 401
   - Test accessing GM-only route as Staff → returns 403

2. src/tests/purchaseRequisition.test.ts:
   - Test creating PR with valid data → returns 201 with serial number
   - Test creating PR with no line items → returns 400 validation error
   - Test submitting a draft PR → status changes to 'submitted'
   - Test staff cannot see another dept's PRs

3. src/tests/approvalWorkflow.test.ts:
   - Test full PR approval chain: Submit → Check → GM Approve
   - Test rejection creates notification for requester
   - Test staff cannot approve their own PR
   - Test checker cannot approve without first checking

4. src/tests/inventory.test.ts:
   - Test issuing more stock than available → returns 400
   - Test GRN increases inventory stock
   - Test SIV decreases inventory stock

Frontend checklist to verify manually:
- [ ] Login works for all 7 roles
- [ ] Each role sees only their permitted navigation items
- [ ] PR form saves as draft, edits work, submission works
- [ ] Approval notification appears in real-time when PR submitted
- [ ] GM can approve from the approval inbox with bulk action
- [ ] GRN links to correct PR and shows 3-way match
- [ ] SIV blocks if stock insufficient
- [ ] Payment request amount-in-words auto-generates correctly
- [ ] PDF downloads correctly for all 4 document types
- [ ] Amharic language toggle works on all pages
- [ ] App installs as PWA on mobile
- [ ] Offline shows offline page (not a blank screen)
- [ ] Session timeout works after 30 minutes inactivity

Run tests: npx jest --coverage
Minimum coverage target: 70%
```

---

## Quick Reference — Useful Follow-up Prompts

Use these whenever you get stuck during any step:

---

**If code is cut off mid-generation:**
```
The code was cut off. Please continue from exactly where you stopped,
starting from the last complete line.
```

---

**If a file has a bug or error:**
```
This file has an error: [paste the error message].
Please fix only this specific issue without changing the rest of the file.
Show me the corrected version of just the affected function/section.
```

---

**If you need to re-add project context:**
```
Reminder: this is the African Holding procurement app.
Tech stack: React + TypeScript (frontend), Node.js + Express (backend),
PostgreSQL (database), JWT auth, Tailwind CSS.
Four document types: PR, GRN, SIV, PRF.
Seven user roles: Admin, GM, Finance, Storekeeper, Checker, Staff, Auditor.
Continue with: [paste your next task]
```

---

**If a component needs to connect to the API:**
```
Connect this component to the backend API.
Base URL is stored in VITE_API_URL environment variable.
Use Axios with JWT token from Zustand authStore.
Add loading states, error handling, and success toasts.
```

---

**If you need a new page added to the router:**
```
Add a new page to the React Router setup in src/App.tsx.
Route: [/route-path]
Component: [ComponentName] in [src/pages/folder/Component.tsx]
Access: protected, roles allowed: [list roles]
Add it to the sidebar navigation in AppLayout.tsx for the allowed roles.
```

---

**If you need to add a missing API endpoint:**
```
Add a new API endpoint to the Express backend.
Method: [GET/POST/PUT/DELETE]
Route: /api/[route]
Purpose: [describe what it does]
Required role: [role name]
Inputs: [list fields]
Response: [describe what to return]
Add input validation, error handling, and audit logging.
```

---

*End of build guide — African Holding Group Procurement Web App*
*Total steps: 12 main steps across 8 phases*
*Estimated build time: 5–7 days with focused effort*