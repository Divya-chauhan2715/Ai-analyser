import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Business dashboard pages
import BusinessDashboard from './pages/dashboard/BusinessDashboard';
import Products from './pages/dashboard/Products';
import Inventory from './pages/dashboard/Inventory';
import Orders from './pages/dashboard/Orders';
import Customers from './pages/dashboard/Customers';
import Payments from './pages/dashboard/Payments';
import Analytics from './pages/dashboard/Analytics';
import AdvancedAnalytics from './pages/dashboard/AdvancedAnalytics';

// Marketplace pages
import Marketplace from './pages/marketplace/Marketplace';
import ProductDetail from './pages/marketplace/ProductDetail';
import Recommendations from './pages/marketplace/Recommendations';
import OrderHistory from './pages/marketplace/OrderHistory';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-surface-500 font-medium">Loading BizConnect...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'business' ? '/dashboard' : '/marketplace'} /> : <Landing />} />
            <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'business' ? '/dashboard' : '/marketplace'} /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to={user.role === 'business' ? '/dashboard' : '/marketplace'} /> : <Register />} />

            {/* Business Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute roles={['business', 'admin']}><BusinessDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/products" element={<ProtectedRoute roles={['business']}><Products /></ProtectedRoute>} />
            <Route path="/dashboard/inventory" element={<ProtectedRoute roles={['business']}><Inventory /></ProtectedRoute>} />
            <Route path="/dashboard/orders" element={<ProtectedRoute roles={['business']}><Orders /></ProtectedRoute>} />
            <Route path="/dashboard/customers" element={<ProtectedRoute roles={['business']}><Customers /></ProtectedRoute>} />
            <Route path="/dashboard/payments" element={<ProtectedRoute roles={['business']}><Payments /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute roles={['business']}><Analytics /></ProtectedRoute>} />
            <Route path="/dashboard/advanced-analytics" element={<ProtectedRoute roles={['business']}><AdvancedAnalytics /></ProtectedRoute>} />

            {/* Marketplace */}
            <Route path="/marketplace" element={<ProtectedRoute roles={['buyer', 'business', 'admin']}><Marketplace /></ProtectedRoute>} />
            <Route path="/marketplace/:id" element={<ProtectedRoute roles={['buyer', 'business', 'admin']}><ProductDetail /></ProtectedRoute>} />
            <Route path="/marketplace/orders" element={<ProtectedRoute roles={['buyer']}><OrderHistory /></ProtectedRoute>} />
            <Route path="/marketplace/recommendations" element={<ProtectedRoute roles={['buyer', 'business', 'admin']}><Recommendations /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
