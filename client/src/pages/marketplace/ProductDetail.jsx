import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingCart, Minus, Plus, Star, Truck, Shield, CreditCard } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import api from '../../utils/api';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchProduct();
    }, [id]);

    const placeOrder = async () => {
        if (!product) return;
        setOrdering(true);
        try {
            await api.post('/orders', {
                items: [{ productId: product._id, quantity }],
                sellerId: product.sellerId._id || product.sellerId,
                paymentMethod,
            });
            alert('Order placed successfully!');
            navigate('/marketplace/orders');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to place order');
        } finally { setOrdering(false); }
    };

    if (loading) {
        return <DashboardLayout><div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;
    }

    if (!product) {
        return <DashboardLayout><div className="text-center py-20"><p className="text-surface-500">Product not found</p></div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="animate-fade-in">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-surface-500 hover:text-primary-600 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to marketplace
                </button>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Image */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-surface-100 shadow-sm">
                        <div className="h-80 lg:h-[450px] bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <Package className="w-24 h-24 text-surface-300" />
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div>
                            <span className="text-sm text-accent-600 bg-accent-50 px-3 py-1 rounded-full font-medium">{product.category}</span>
                            <h1 className="text-3xl font-bold text-surface-900 mt-3">{product.name}</h1>
                            {product.sellerId && (
                                <p className="text-surface-400 mt-2 flex items-center gap-2">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span>by {product.sellerId.businessName || product.sellerId.name}</span>
                                </p>
                            )}
                        </div>

                        <div className="text-4xl font-bold text-primary-600">₹{product.price?.toLocaleString()}</div>

                        <p className="text-surface-600 leading-relaxed">{product.description || 'No description available.'}</p>

                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${product.stock > 0 ? 'bg-accent-50 text-accent-700' : 'bg-red-50 text-red-600'
                            }`}>
                            {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
                        </div>

                        {product.stock > 0 && (
                            <div className="space-y-4 bg-surface-50 rounded-2xl p-6">
                                {/* Quantity */}
                                <div>
                                    <label className="text-sm font-medium text-surface-700 mb-2 block">Quantity</label>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-xl border border-surface-200 flex items-center justify-center hover:bg-white transition-colors">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-xl font-bold text-surface-800 w-16 text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-10 h-10 rounded-xl border border-surface-200 flex items-center justify-center hover:bg-white transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="text-sm font-medium text-surface-700 mb-2 block">Payment Method</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['upi', 'bank_transfer', 'cash'].map(m => (
                                            <button key={m} onClick={() => setPaymentMethod(m)}
                                                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${paymentMethod === m
                                                        ? 'bg-primary-600 text-white shadow-md'
                                                        : 'bg-white border border-surface-200 text-surface-600 hover:border-primary-300'
                                                    }`}>
                                                {m === 'bank_transfer' ? 'Bank Transfer' : m.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between text-lg font-bold pt-4 border-t border-surface-200">
                                    <span className="text-surface-600">Total:</span>
                                    <span className="text-primary-600">₹{(product.price * quantity).toLocaleString()}</span>
                                </div>

                                <button onClick={placeOrder} disabled={ordering}
                                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-600/25 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-60">
                                    {ordering ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-6 h-6" />
                                            Place Order
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: Truck, label: 'Fast Delivery' },
                                { icon: Shield, label: 'Secure Order' },
                                { icon: CreditCard, label: 'Easy Payment' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-surface-100">
                                    <Icon className="w-5 h-5 text-accent-500" />
                                    <span className="text-xs text-surface-500 font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProductDetail;
