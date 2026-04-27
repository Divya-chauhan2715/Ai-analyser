import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package, X, Upload, Image } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../utils/api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: '', image: '' });
    const [saving, setSaving] = useState(false);

    const categories = ['Electronics', 'Textiles', 'Food & Beverages', 'Hardware', 'Chemicals', 'Packaging', 'Other'];

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products/my');
            setProducts(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openAdd = () => {
        setEditingProduct(null);
        setForm({ name: '', description: '', price: '', stock: '', category: '', image: '' });
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: product.category,
            image: product.image || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, payload);
            } else {
                await api.post('/products', payload);
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save product');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) { alert('Failed to delete product'); }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

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
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-surface-800">Products</h2>
                        <p className="text-surface-400 text-sm">{products.length} products total</p>
                    </div>
                    <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-medium rounded-xl hover:shadow-lg transition-all">
                        <Plus className="w-5 h-5" /> Add Product
                    </button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none bg-white"
                    />
                </div>

                {/* Product Grid */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
                        <Package className="w-16 h-16 text-surface-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-surface-600">No products found</h3>
                        <p className="text-surface-400 text-sm mt-1">Add your first product to get started</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((product) => (
                            <div key={product._id} className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-lg transition-all group">
                                <div className="h-40 bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center overflow-hidden">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <Package className="w-12 h-12 text-surface-300" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-surface-800 truncate">{product.name}</h3>
                                            <span className="text-xs text-surface-400 bg-surface-50 px-2 py-0.5 rounded-full">{product.category}</span>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-primary-600 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-lg font-bold text-primary-600">₹{product.price?.toLocaleString()}</span>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-accent-50 text-accent-700'
                                            }`}>
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                    {!product.isApproved && (
                                        <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-center">⏳ Pending Approval</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-surface-100">
                            <h3 className="text-xl font-bold text-surface-800">
                                {editingProduct ? 'Edit Product' : 'Add Product'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-surface-100">
                                <X className="w-5 h-5 text-surface-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">Product Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none resize-none" rows="3" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Price (₹)</label>
                                    <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Stock Qty</label>
                                    <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none bg-white" required>
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-700 mb-1">Image URL</label>
                                <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none" />
                            </div>
                            <button type="submit" disabled={saving}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (editingProduct ? 'Update Product' : 'Add Product')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Products;
