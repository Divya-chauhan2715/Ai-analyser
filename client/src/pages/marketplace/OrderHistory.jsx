import { useState, useEffect } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../utils/api';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try { const res = await api.get('/orders'); setOrders(res.data); }
            catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) {
        return <DashboardLayout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-surface-800">My Orders</h2>
                    <p className="text-surface-400 text-sm">{orders.length} orders placed</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-surface-100">
                        <ShoppingCart className="w-16 h-16 text-surface-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-surface-600">No orders yet</h3>
                        <p className="text-surface-400 text-sm mt-1">Browse the marketplace to place your first order</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <span className="text-xs font-mono text-surface-400">Order #{order._id?.slice(-6)}</span>
                                        <p className="text-sm text-surface-500 mt-1">
                                            Seller: <span className="font-medium text-surface-700">{order.sellerId?.businessName || order.sellerId?.name}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'completed' ? 'bg-accent-50 text-accent-700' :
                                                order.orderStatus === 'shipped' ? 'bg-blue-50 text-blue-700' :
                                                    order.orderStatus === 'confirmed' ? 'bg-indigo-50 text-indigo-700' :
                                                        'bg-amber-50 text-amber-700'
                                            }`}>{order.orderStatus}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-accent-50 text-accent-700' :
                                                order.paymentStatus === 'overdue' ? 'bg-red-50 text-red-600' :
                                                    'bg-amber-50 text-amber-700'
                                            }`}>{order.paymentStatus}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm bg-surface-50 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Package className="w-5 h-5 text-surface-400" />
                                                <div>
                                                    <span className="font-medium text-surface-700">{item.name}</span>
                                                    <span className="text-surface-400 ml-2">× {item.quantity}</span>
                                                </div>
                                            </div>
                                            <span className="font-semibold text-surface-800">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100">
                                    <span className="text-xs text-surface-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    <span className="text-lg font-bold text-primary-600">₹{order.totalAmount?.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrderHistory;
