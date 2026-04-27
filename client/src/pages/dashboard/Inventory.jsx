import { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle2, TrendingDown, Package } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../utils/api';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products/my');
                setProducts(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchProducts();
    }, []);

    const filtered = products.filter(p => {
        if (filter === 'low') return p.stock < 10;
        if (filter === 'out') return p.stock === 0;
        if (filter === 'healthy') return p.stock >= 10;
        return true;
    });

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter(p => p.stock < 10 && p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const healthyStock = products.filter(p => p.stock >= 10).length;

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
                    <h2 className="text-2xl font-bold text-surface-800">Inventory</h2>
                    <p className="text-surface-400 text-sm">Track stock levels across all products</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                                <Boxes className="w-5 h-5 text-primary-600" />
                            </div>
                            <span className="text-sm text-surface-500">Total Stock</span>
                        </div>
                        <div className="text-2xl font-bold text-surface-800">{totalStock.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-accent-600" />
                            </div>
                            <span className="text-sm text-surface-500">Healthy</span>
                        </div>
                        <div className="text-2xl font-bold text-accent-600">{healthyStock}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="text-sm text-surface-500">Low Stock</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-sm text-surface-500">Out of Stock</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{outOfStock}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'healthy', label: 'Healthy' },
                        { key: 'low', label: 'Low Stock' },
                        { key: 'out', label: 'Out of Stock' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                    : 'bg-white text-surface-600 hover:bg-surface-50 border border-surface-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-50 text-surface-500">
                                    <th className="text-left px-6 py-4 font-medium">Product</th>
                                    <th className="text-left px-6 py-4 font-medium">Category</th>
                                    <th className="text-left px-6 py-4 font-medium">Price</th>
                                    <th className="text-left px-6 py-4 font-medium">Stock</th>
                                    <th className="text-left px-6 py-4 font-medium">Status</th>
                                    <th className="text-left px-6 py-4 font-medium">Stock Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-surface-400">
                                            <Package className="w-10 h-10 mx-auto mb-2 text-surface-300" />
                                            No products match this filter
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((p) => {
                                        const stockPercent = Math.min((p.stock / 100) * 100, 100);
                                        const stockColor = p.stock === 0 ? 'bg-red-500' : p.stock < 10 ? 'bg-amber-500' : 'bg-accent-500';
                                        return (
                                            <tr key={p._id} className="border-t border-surface-50 hover:bg-surface-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-surface-400" />}
                                                        </div>
                                                        <span className="font-medium text-surface-800">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-surface-500">{p.category}</td>
                                                <td className="px-6 py-4 font-semibold text-surface-800">₹{p.price?.toLocaleString()}</td>
                                                <td className="px-6 py-4 font-bold text-surface-800">{p.stock}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.stock === 0 ? 'bg-red-50 text-red-600' :
                                                            p.stock < 10 ? 'bg-amber-50 text-amber-600' :
                                                                'bg-accent-50 text-accent-700'
                                                        }`}>
                                                        {p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'In Stock'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-24 h-2 bg-surface-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${stockColor} transition-all`} style={{ width: `${stockPercent}%` }} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Inventory;
