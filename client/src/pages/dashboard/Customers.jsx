import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, DollarSign, ShoppingCart } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../utils/api';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            try { const res = await api.get('/customers'); setCustomers(res.data); }
            catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const viewCustomer = async (customer) => {
        setSelected(customer);
        try {
            const res = await api.get(`/customers/${customer._id}`);
            setCustomerOrders(res.data.orders || []);
        } catch (err) { setCustomerOrders([]); }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);

    if (loading) {
        return <DashboardLayout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-surface-800">Customers</h2>
                    <p className="text-surface-400 text-sm">{customers.length} customers • ₹{totalRevenue.toLocaleString()} total revenue</p>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                    <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none bg-white" />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Customer List */}
                    <div className="lg:col-span-2">
                        {filtered.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-surface-100">
                                <Users className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                                <p className="text-surface-500 font-medium">No customers found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filtered.map((c) => (
                                    <div key={c._id}
                                        onClick={() => viewCustomer(c)}
                                        className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${selected?._id === c._id ? 'border-primary-600 shadow-md ring-2 ring-primary-600/10' : 'border-surface-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {c.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-surface-800">{c.name}</h3>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        {c.email && <span className="text-xs text-surface-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
                                                        {c.phone && <span className="text-xs text-surface-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-primary-600">₹{(c.totalRevenue || 0).toLocaleString()}</div>
                                                <div className="text-xs text-surface-400">{c.totalOrders || 0} orders</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Customer Detail */}
                    <div>
                        {selected ? (
                            <div className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm sticky top-20 animate-fade-in">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                                        {selected.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <h3 className="text-lg font-bold text-surface-800">{selected.name}</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <DollarSign className="w-4 h-4 text-surface-400" />
                                        <span className="text-surface-500">Revenue:</span>
                                        <span className="font-bold text-accent-600 ml-auto">₹{(selected.totalRevenue || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <ShoppingCart className="w-4 h-4 text-surface-400" />
                                        <span className="text-surface-500">Orders:</span>
                                        <span className="font-bold text-surface-800 ml-auto">{selected.totalOrders || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-surface-400" />
                                        <span className="text-surface-500">Last Order:</span>
                                        <span className="font-medium text-surface-700 ml-auto">{selected.lastOrderDate ? new Date(selected.lastOrderDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    {selected.email && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="w-4 h-4 text-surface-400" />
                                            <span className="text-surface-500">Email:</span>
                                            <span className="font-medium text-surface-700 ml-auto text-xs">{selected.email}</span>
                                        </div>
                                    )}
                                </div>

                                {customerOrders.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-surface-100">
                                        <h4 className="font-semibold text-surface-700 mb-3">Purchase History</h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {customerOrders.map(o => (
                                                <div key={o._id} className="flex justify-between items-center text-xs bg-surface-50 rounded-lg px-3 py-2">
                                                    <div>
                                                        <span className="font-mono text-surface-400">#{o._id?.slice(-6)}</span>
                                                        <span className="ml-2 text-surface-600">{new Date(o.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <span className="font-bold text-surface-800">₹{o.totalAmount?.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-8 text-center border border-surface-100">
                                <Users className="w-10 h-10 text-surface-300 mx-auto mb-3" />
                                <p className="text-surface-400 text-sm">Select a customer to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Customers;
