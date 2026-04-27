import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Package, ShoppingCart, Users, CreditCard,
    BarChart3, Settings, LogOut, Menu, X, Bell, ChevronDown,
    Store, Shield, Boxes, TrendingUp, Sparkles, Brain
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const businessLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/dashboard/products', icon: Package, label: 'Products' },
        { to: '/dashboard/inventory', icon: Boxes, label: 'Inventory' },
        { to: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
        { to: '/dashboard/customers', icon: Users, label: 'Customers' },
        { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
        { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/dashboard/advanced-analytics', icon: Brain, label: 'AI Analytics' },
    ];

    const buyerLinks = [
        { to: '/marketplace', icon: Store, label: 'Marketplace' },
        { to: '/marketplace/orders', icon: ShoppingCart, label: 'My Orders' },
        { to: '/marketplace/recommendations', icon: Sparkles, label: 'AI Picks' },
    ];

    const adminLinks = [
        { to: '/admin', icon: Shield, label: 'Admin Panel' },
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ];

    const getNavLinks = () => {
        if (user?.role === 'admin') return adminLinks;
        if (user?.role === 'business') return businessLinks;
        return buyerLinks;
    };

    const navLinks = getNavLinks();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-surface-100 flex">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-primary-600 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-primary-500">
                    {sidebarOpen && (
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg">BizConnect</span>
                        </Link>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-primary-500 transition-colors">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                                        : 'text-primary-100 hover:bg-primary-500 hover:text-white'
                                    }`}
                            >
                                <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-primary-200 group-hover:text-white'}`} />
                                {sidebarOpen && <span className="font-medium text-sm">{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="p-3 border-t border-primary-500">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-primary-200 hover:bg-red-500/20 hover:text-red-300 transition-all"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <aside className="w-72 bg-primary-600 h-full text-white animate-slide-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between h-16 px-4 border-b border-primary-500">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-lg">BizConnect</span>
                            </Link>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-primary-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="py-6 px-3 space-y-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-accent-500 text-white' : 'text-primary-100 hover:bg-primary-500'
                                            }`}
                                    >
                                        <link.icon className="w-5 h-5" />
                                        <span className="font-medium text-sm">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-3 border-t border-primary-500">
                            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-primary-200 hover:bg-red-500/20 hover:text-red-300">
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium text-sm">Logout</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface-100">
                            <Menu className="w-5 h-5 text-surface-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-surface-800 hidden sm:block">
                            {navLinks.find(l => l.to === location.pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-lg hover:bg-surface-100 transition-colors">
                            <Bell className="w-5 h-5 text-surface-500" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full animate-pulse-glow" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setProfileDropdown(!profileDropdown)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-surface-700">{user?.name}</span>
                                <ChevronDown className="w-4 h-4 text-surface-400" />
                            </button>

                            {profileDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-surface-200 py-2 animate-fade-in z-50">
                                    <div className="px-4 py-2 border-b border-surface-100">
                                        <p className="text-sm font-medium text-surface-800">{user?.name}</p>
                                        <p className="text-xs text-surface-400">{user?.email}</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full font-medium capitalize">
                                            {user?.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
