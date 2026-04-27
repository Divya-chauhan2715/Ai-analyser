import { useState, useEffect } from 'react';
import { ShoppingCart, Eye, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { user } = useAuth();

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const updateOrderStatus = async (orderId, orderStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { orderStatus });
            fetchOrders();
        } catch (err) { alert('Failed to update order status'); }
    };

    const updatePaymentStatus = async (orderId, paymentStatus) => {
        try {
            await api.put(`/orders/${orderId}/payment`, { paymentStatus });
            fetchOrders();
        } catch (err) { alert('Failed to update payment status'); }
    };

    const filtered = orders.filter(o => {
        if (filter === 'all') return true;
        return o.orderStatus === filter;
    });

    const statusCounts = {
        all: orders.length,
        pending: orders.filter(o => o.orderStatus === 'pending').length,
        confirmed: orders.filter(o => o.orderStatus === 'confirmed').length,
        shipped: orders.filter(o => o.orderStatus === 'shipped').length,
        completed: orders.filter(o => o.orderStatus === 'completed').length,
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-surface-800">Orders</h2>
                    <p className="text-surface-400 text-sm">{orders.length} total orders</p>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'confirmed', 'shipped', 'completed'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${filter === s
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-white text-surface-600 hover:bg-surface-50 border border-surface-200'
                                }`}
                        >
                            <span className="capitalize">{s}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === s ? 'bg-white/20' : 'bg-surface-100'
                                }`}>{statusCounts[s]}</span>
                        </button>
                    ))}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-50 text-surface-500">
                                    <th className="text-left px-6 py-4 font-medium">Order ID</th>
                                    <th className="text-left px-6 py-4 font-medium">{user?.role === 'business' ? 'Buyer' : 'Seller'}</th>
                                    <th className="text-left px-6 py-4 font-medium">Items</th>
                                    <th className="text-left px-6 py-4 font-medium">Amount</th>
                                    <th className="text-left px-6 py-4 font-medium">Order Status</th>
                                    <th className="text-left px-6 py-4 font-medium">Payment</th>
                                    <th className="text-left px-6 py-4 font-medium">Date</th>
                                    <th className="text-left px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-12 text-surface-400">
                                            <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-surface-300" />
                                            No orders found
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((order) => (
                                        <tr key={order._id} className="border-t border-surface-50 hover:bg-surface-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-surface-500">#{order._id?.slice(-6)}</td>
                                            <td className="px-6 py-4 text-surface-700">
                                                {user?.role === 'business' ? order.buyerId?.name : order.sellerId?.name || order.sellerId?.businessName}
                                            </td>
                                            <td className="px-6 py-4 text-surface-600">{order.items?.length} items</td>
                                            <td className="px-6 py-4 font-bold text-surface-800">₹{order.totalAmount?.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                {user?.role === 'business' ? (
                                                    <select
                                                        value={order.orderStatus}
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 outline-none cursor-pointer ${order.orderStatus === 'completed' ? 'bg-accent-50 text-accent-700' :
                                                                order.orderStatus === 'shipped' ? 'bg-blue-50 text-blue-700' :
                                                                    order.orderStatus === 'confirmed' ? 'bg-indigo-50 text-indigo-700' :
                                                                        'bg-amber-50 text-amber-700'
                                                            }`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'completed' ? 'bg-accent-50 text-accent-700' :
                                                            order.orderStatus === 'shipped' ? 'bg-blue-50 text-blue-700' :
                                                                order.orderStatus === 'confirmed' ? 'bg-indigo-50 text-indigo-700' :
                                                                    'bg-amber-50 text-amber-700'
                                                        }`}>
                                                        {order.orderStatus}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user?.role === 'business' ? (
                                                    <select
                                                        value={order.paymentStatus}
                                                        onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 outline-none cursor-pointer ${order.paymentStatus === 'paid' ? 'bg-accent-50 text-accent-700' :
                                                                order.paymentStatus === 'overdue' ? 'bg-red-50 text-red-600' :
                                                                    'bg-amber-50 text-amber-700'
                                                            }`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="paid">Paid</option>
                                                        <option value="overdue">Overdue</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-accent-50 text-accent-700' :
                                                            order.paymentStatus === 'overdue' ? 'bg-red-50 text-red-600' :
                                                                'bg-amber-50 text-amber-700'
                                                        }`}>
                                                        {order.paymentStatus}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-surface-500 text-xs">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                                                    className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-primary-600 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Detail Panel */}
                {selectedOrder && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-100 animate-fade-in">
                        <h3 className="text-lg font-bold text-surface-800 mb-4">Order Details — #{selectedOrder._id?.slice(-6)}</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <p className="text-sm"><span className="text-surface-400">Buyer:</span> <span className="font-medium text-surface-700">{selectedOrder.buyerId?.name}</span></p>
                                <p className="text-sm"><span className="text-surface-400">Email:</span> <span className="font-medium text-surface-700">{selectedOrder.buyerId?.email}</span></p>
                                <p className="text-sm"><span className="text-surface-400">Payment Method:</span> <span className="font-medium text-surface-700 uppercase">{selectedOrder.paymentMethod || 'Not specified'}</span></p>
                                <p className="text-sm"><span className="text-surface-400">Date:</span> <span className="font-medium text-surface-700">{new Date(selectedOrder.createdAt).toLocaleString()}</span></p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-surface-700 mb-3">Items</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm bg-surface-50 rounded-lg px-4 py-2">
                                            <span className="text-surface-700">{item.name} × {item.quantity}</span>
                                            <span className="font-semibold text-surface-800">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center text-sm font-bold border-t border-surface-200 pt-2 px-4">
                                        <span>Total</span>
                                        <span className="text-primary-600">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Orders;
