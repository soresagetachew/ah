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
import GRNDetailPage from './pages/grn/GRNDetailPage';
import SIVListPage from './pages/siv/SIVListPage';
import CreateSIVPage from './pages/siv/CreateSIVPage';
import SIVDetailPage from './pages/siv/SIVDetailPage';
import PRFListPage from './pages/payment/PRFListPage';
import PRFDetailPage from './pages/payment/PRFDetailPage';
import NotFoundPage from './pages/error/NotFoundPage';
import UnauthorizedPage from './pages/error/UnauthorizedPage';
import AssetsPage from './pages/admin/AssetsPage';
import CreateAssetPage from './pages/admin/CreateAssetPage';
import SettingsPage from './pages/settings/SettingsPage';
import { useAuthStore } from './store/authStore';
import { useSettings } from './context/SettingsContext';
import { AlertTriangle } from 'lucide-react';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { settings } = useSettings();
  
  const isMaintenance = settings['maintenance_mode'] === 'true' && user?.role !== 'System Admin';

  return (
    <>
      {isMaintenance && (
        <div className="bg-amber-600 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 z-[9999] relative">
          <AlertTriangle className="h-4 w-4" />
          {settings['maintenance_message'] || 'The system is currently undergoing maintenance. Some features may be unavailable.'}
        </div>
      )}
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
          <Route path="/goods-receiving-notes/:id" element={<GRNDetailPage />} />
          <Route path="/store-issued-vouchers" element={<SIVListPage />} />
          <Route path="/store-issued-vouchers/new" element={<CreateSIVPage />} />
          <Route path="/store-issued-vouchers/:id" element={<SIVDetailPage />} />
          <Route path="/payment-requests" element={<PRFListPage />} />
          <Route path="/payment-requests/new" element={<CreatePaymentRequestPage />} />
          <Route path="/payment-requests/:id" element={<PRFDetailPage />} />
          <Route path="/approvals" element={<ApprovalInboxPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          
          <Route element={<ProtectedRoute allowedRoles={['System Admin']} />}>
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/new" element={<CreateAssetPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          
          <Route element={<ProtectedRoute allowedRoles={['System Admin', 'Storekeeper', 'GM']} />}>
            <Route path="/inventory" element={<InventoryPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  );
}

export default App;
