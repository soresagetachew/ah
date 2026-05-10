import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import UsersPage from './pages/admin/UsersPage';
import CreatePRPage from './pages/pr/CreatePRPage';
import PRListPage from './pages/pr/PRListPage';
import PRDetailPage from './pages/pr/PRDetailPage';
import ApprovalInboxPage from './pages/approvals/ApprovalInboxPage';
import InventoryPage from './pages/inventory/InventoryPage';
import CreatePaymentRequestPage from './pages/payment/CreatePaymentRequestPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ReportsPage from './pages/reports/ReportsPage';
import GRNListPage from './pages/grn/GRNListPage';
import CreateGRNPage from './pages/grn/CreateGRNPage';
import SIVListPage from './pages/siv/SIVListPage';
import CreateSIVPage from './pages/siv/CreateSIVPage';
import PRFListPage from './pages/payment/PRFListPage';
import NotFoundPage from './pages/error/NotFoundPage';
import UnauthorizedPage from './pages/error/UnauthorizedPage';
import AssetsPage from './pages/admin/AssetsPage';
import CreateAssetPage from './pages/admin/CreateAssetPage';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/purchase-requisitions" element={<PRListPage />} />
          <Route path="/purchase-requisitions/new" element={<CreatePRPage />} />
          <Route path="/purchase-requisitions/:id" element={<PRDetailPage />} />
          <Route path="/goods-receiving-notes" element={<GRNListPage />} />
          <Route path="/goods-receiving-notes/new" element={<CreateGRNPage />} />
          <Route path="/store-issued-vouchers" element={<SIVListPage />} />
          <Route path="/store-issued-vouchers/new" element={<CreateSIVPage />} />
          <Route path="/payment-requests" element={<PRFListPage />} />
          <Route path="/payment-requests/new" element={<CreatePaymentRequestPage />} />
          <Route path="/approvals" element={<ApprovalInboxPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          
          <Route element={<ProtectedRoute allowedRoles={['System Admin']} />}>
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/new" element={<CreateAssetPage />} />
          </Route>

          
          <Route element={<ProtectedRoute allowedRoles={['System Admin', 'Storekeeper', 'GM']} />}>
            <Route path="/inventory" element={<InventoryPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
