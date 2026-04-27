import { useState, useEffect } from 'react';
import { Shield, Users, Package, ShoppingCart, CheckCircle2, XCircle, DollarSign, TrendingUp, Ban, UserCheck } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../utils/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('users');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, usersRes, productsRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/users'),
                    api.get('/admin/products/pending'),
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setPendingProducts(productsRes.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const verifyUser = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/verify`);
            setUsers(users.map(u => u._id === userId ? { ...u, isVerified: true } : u));
        } catch (err) { alert('Failed to verify user'); }
    };

    const suspendUser = async (userId) => {
        try {
            const res = await api.put(`/admin/users/${userId}/suspend`);
            setUsers(users.map(u => u._id === userId ? { ...u, isSuspended: !u.isSuspended } : u));
        } catch (err) { alert('Failed to update user status'); }
    };

    const approveProduct = async (productId) => {
        try {
            await api.put(`/admin/products/${productId}/approve`);
            setPendingProducts(pendingProducts.filter(p => p._id !== productId));
            setStats({ ...stats, pendingApprovals: (stats.pendingApprovals || 1) - 1 });
        } catch (err) { alert('Failed to approve product'); }
    };

    if (loading) {
        return <DashboardLayout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-surface-800">Admin Panel</h2>
                    <p className="text-surface-400 text-sm">Platform management & oversight</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'from-primary-600 to-primary-700' },
                        { label: 'Businesses', value: stats.totalBusinesses || 0, icon: Shield, color: 'from-accent-500 to-accent-600' },
                        { label: 'Products', value: stats.totalProducts || 0, icon: Package, color: 'from-violet-500 to-indigo-600' },
                        { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingCart, color: 'from-amber-500 to-orange-500' },
                        { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-green-600' },
                        { label: 'Buyers', value: stats.totalBuyers || 0, icon: Users, color: 'from-blue-500 to-cyan-600' },
                        { label: 'Pending Verify', value: stats.pendingVerifications || 0, icon: UserCheck, color: 'from-rose-500 to-pink-600' },
                        { label: 'Pending Approvals', value: stats.pendingApprovals || 0, icon: Package, color: 'from-amber-500 to-red-500' },
                    ].map((c) => (
                        <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-surface-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                                    <c.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs text-surface-500">{c.label}</span>
                            </div>
                            <div className="text-2xl font-bold text-surface-800">{c.value}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <button onClick={() => setTab('users')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'users' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-surface-600 border border-surface-200'}`}>
                        Users ({users.length})
                    </button>
                    <button onClick={() => setTab('products')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'products' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-surface-600 border border-surface-200'}`}>
                        Pending Products ({pendingProducts.length})
                    </button>
                </div>

                {/* Users Tab */}
                {tab === 'users' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-surface-50 text-surface-500">
                                        <th className="text-left px-6 py-4 font-medium">Name</th>
                                        <th className="text-left px-6 py-4 font-medium">Email</th>
                                        <th className="text-left px-6 py-4 font-medium">Role</th>
                                        <th className="text-left px-6 py-4 font-medium">Verified</th>
                                        <th className="text-left px-6 py-4 font-medium">Status</th>
                                        <th className="text-left px-6 py-4 font-medium">Joined</th>
                                        <th className="text-left px-6 py-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} className="border-t border-surface-50 hover:bg-surface-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-surface-800">{u.name}</td>
                                            <td className="px-6 py-4 text-surface-500 text-xs">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                                                        u.role === 'business' ? 'bg-primary-50 text-primary-700' :
                                                            'bg-accent-50 text-accent-700'
                                                    }`}>{u.role}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.isVerified ? <CheckCircle2 className="w-5 h-5 text-accent-500" /> : <XCircle className="w-5 h-5 text-surface-300" />}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.isSuspended ? 'bg-red-50 text-red-600' : 'bg-accent-50 text-accent-700'}`}>
                                                    {u.isSuspended ? 'Suspended' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-surface-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1">
                                                    {!u.isVerified && u.role === 'business' && (
                                                        <button onClick={() => verifyUser(u._id)}
                                                            className="px-3 py-1.5 bg-accent-50 text-accent-700 rounded-lg text-xs font-medium hover:bg-accent-100 transition-colors flex items-center gap-1">
                                                            <UserCheck className="w-3 h-3" /> Verify
                                                        </button>
                                                    )}
                                                    {u.role !== 'admin' && (
                                                        <button onClick={() => suspendUser(u._id)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${u.isSuspended ? 'bg-accent-50 text-accent-700 hover:bg-accent-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                                }`}>
                                                            <Ban className="w-3 h-3" /> {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pending Products Tab */}
                {tab === 'products' && (
                    <div className="space-y-3">
                        {pendingProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-surface-100">
                                <CheckCircle2 className="w-12 h-12 text-accent-500 mx-auto mb-3" />
                                <p className="text-surface-600 font-medium">All products are approved!</p>
                            </div>
                        ) : (
                            pendingProducts.map(p => (
                                <div key={p._id} className="bg-white rounded-2xl p-5 border border-surface-100 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-surface-100 rounded-xl flex items-center justify-center overflow-hidden">
                                            {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-surface-400" />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-surface-800">{p.name}</h3>
                                            <p className="text-xs text-surface-400">{p.category} • ₹{p.price?.toLocaleString()} • by {p.sellerId?.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => approveProduct(p._id)}
                                        className="px-5 py-2 bg-accent-500 text-white rounded-xl text-sm font-medium hover:bg-accent-600 transition-colors flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Approve
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
