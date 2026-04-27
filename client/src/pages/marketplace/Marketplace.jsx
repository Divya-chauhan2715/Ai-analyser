import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Package, Star, ShoppingCart } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../utils/api';

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    api.get('/products', { params: { search, category: selectedCategory } }),
                    api.get('/products/categories'),
                ]);
                setProducts(prodRes.data);
                setCategories(catRes.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [search, selectedCategory]);

    if (loading) {
        return <DashboardLayout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-surface-800">Marketplace</h2>
                        <p className="text-surface-400 text-sm">{products.length} products available</p>
                    </div>
                    <Link to="/marketplace/orders" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-all">
                        <ShoppingCart className="w-5 h-5" /> My Orders
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none bg-white" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setSelectedCategory('')}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!selectedCategory ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'}`}>
                            All
                        </button>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
                        <Package className="w-16 h-16 text-surface-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-surface-600">No products found</h3>
                        <p className="text-surface-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {products.map((product) => (
                            <Link key={product._id} to={`/marketplace/${product._id}`}
                                className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                <div className="h-48 bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center overflow-hidden">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <Package className="w-16 h-16 text-surface-300" />
                                    )}
                                </div>
                                <div className="p-5">
                                    <span className="text-xs text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full font-medium">{product.category}</span>
                                    <h3 className="font-bold text-surface-800 mt-2 text-lg group-hover:text-primary-600 transition-colors">{product.name}</h3>
                                    <p className="text-surface-400 text-sm mt-1 line-clamp-2">{product.description}</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-xl font-bold text-primary-600">₹{product.price?.toLocaleString()}</span>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-accent-50 text-accent-700' : 'bg-red-50 text-red-600'}`}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </div>
                                    {product.sellerId && (
                                        <p className="text-xs text-surface-400 mt-3 flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            {product.sellerId.businessName || product.sellerId.name}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Marketplace;
