import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../utils/api';

const Payments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetch = async () => {
            try { const res = await api.get('/orders'); setOrders(res.data); }
            catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const updatePayment = async (orderId, paymentStatus, paymentMethod) => {
        try {
            await api.put(`/orders/${orderId}/payment`, { paymentStatus, paymentMethod });
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) { alert('Failed to update payment'); }
    };

    const filtered = orders.filter(o => {
        if (filter === 'all') return true;
        return o.paymentStatus === filter;
    });

    const totalPaid = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPending = orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOverdue = orders.filter(o => o.paymentStatus === 'overdue').reduce((sum, o) => sum + o.totalAmount, 0);

    if (loading) {
        return <DashboardLayout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-surface-800">Payments</h2>
                    <p className="text-surface-400 text-sm">Track payment status for all orders</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-accent-600" /></div>
                            <span className="text-sm text-surface-500">Paid</span>
                        </div>
                        <div className="text-2xl font-bold text-accent-600">₹{totalPaid.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
                            <span className="text-sm text-surface-500">Pending</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">₹{totalPending.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-600" /></div>
                            <span className="text-sm text-surface-500">Overdue</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">₹{totalOverdue.toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'paid', 'overdue'].map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === s ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-surface-600 hover:bg-surface-50 border border-surface-200'
                                }`}>{s}</button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-50 text-surface-500">
                                    <th className="text-left px-6 py-4 font-medium">Order</th>
                                    <th className="text-left px-6 py-4 font-medium">Buyer</th>
                                    <th className="text-left px-6 py-4 font-medium">Amount</th>
                                    <th className="text-left px-6 py-4 font-medium">Status</th>
                                    <th className="text-left px-6 py-4 font-medium">Method</th>
                                    <th className="text-left px-6 py-4 font-medium">Date</th>
                                    <th className="text-left px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-12 text-surface-400">
                                        <CreditCard className="w-10 h-10 mx-auto mb-2 text-surface-300" />No payments found
                                    </td></tr>
                                ) : filtered.map(order => (
                                    <tr key={order._id} className="border-t border-surface-50 hover:bg-surface-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-surface-500">#{order._id?.slice(-6)}</td>
                                        <td className="px-6 py-4 text-surface-700">{order.buyerId?.name}</td>
                                        <td className="px-6 py-4 font-bold text-surface-800">₹{order.totalAmount?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-accent-50 text-accent-700' :
                                                    order.paymentStatus === 'overdue' ? 'bg-red-50 text-red-600' :
                                                        'bg-amber-50 text-amber-700'
                                                }`}>{order.paymentStatus}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select value={order.paymentMethod || ''} onChange={(e) => updatePayment(order._id, order.paymentStatus, e.target.value)}
                                                className="px-3 py-1.5 rounded-lg text-xs bg-surface-50 border border-surface-200 outline-none">
                                                <option value="">Not set</option>
                                                <option value="upi">UPI</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="cash">Cash</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-surface-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                {order.paymentStatus !== 'paid' && (
                                                    <button onClick={() => updatePayment(order._id, 'paid', order.paymentMethod)}
                                                        className="px-3 py-1.5 bg-accent-50 text-accent-700 rounded-lg text-xs font-medium hover:bg-accent-100 transition-colors">
                                                        Mark Paid
                                                    </button>
                                                )}
                                                {order.paymentStatus === 'pending' && (
                                                    <button onClick={() => updatePayment(order._id, 'overdue', order.paymentMethod)}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                                                        Overdue
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
            </div>
        </DashboardLayout>
    );
};

export default Payments;
