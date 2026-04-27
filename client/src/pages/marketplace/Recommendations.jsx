import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Sparkles, TrendingUp, ShoppingBag, Star, RefreshCw, Zap } from 'lucide-react';

const ML_API = 'http://localhost:5002';

const Recommendations = () => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [method, setMethod] = useState('hybrid');

    useEffect(() => {
        fetchRecommendations();
        fetchTrending();
    }, [user, method]);

    const fetchRecommendations = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`${ML_API}/api/ml/recommendations/${user.id}?method=${method}&n=6`);
            const data = await res.json();
            setRecommendations(data.recommendations || []);
            setError(null);
        } catch (err) {
            setError('Analytics service is not running. Start it with: python analytics-service/app.py');
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrending = async () => {
        try {
            const res = await fetch(`${ML_API}/api/ml/trending?n=8`);
            const data = await res.json();
            setTrending(data.trending || []);
        } catch {
            setTrending([]);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                            <Sparkles className="w-7 h-7 text-accent-500" />
                            AI Recommendations
                        </h1>
                        <p className="text-surface-500 mt-1">
                            Personalized product suggestions powered by machine learning
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="px-3 py-2 border border-surface-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="hybrid">Hybrid (Best)</option>
                            <option value="content">Content-Based</option>
                            <option value="collaborative">Collaborative</option>
                        </select>
                        <button
                            onClick={fetchRecommendations}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-amber-800 text-sm font-medium">⚠️ {error}</p>
                        <p className="text-amber-600 text-xs mt-1">
                            Run: <code className="bg-amber-100 px-2 py-0.5 rounded">cd analytics-service && python app.py</code>
                        </p>
                    </div>
                )}

                {/* How It Works */}
                <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-6 text-white">
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5" /> How Our AI Recommendations Work
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <h3 className="font-semibold text-sm mb-1">📋 Content-Based</h3>
                            <p className="text-xs text-white/80">Analyzes categories you've purchased from to suggest similar products</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <h3 className="font-semibold text-sm mb-1">🤝 Collaborative</h3>
                            <p className="text-xs text-white/80">Finds users with similar buying patterns and suggests what they bought</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <h3 className="font-semibold text-sm mb-1">⭐ Hybrid</h3>
                            <p className="text-xs text-white/80">Combines both methods for the most accurate recommendations</p>
                        </div>
                    </div>
                </div>

                {/* Personalized Recommendations */}
                <div>
                    <h2 className="text-xl font-bold text-surface-800 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Recommended For You
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-xl border border-surface-200 p-4 animate-pulse">
                                    <div className="h-4 bg-surface-200 rounded w-3/4 mb-3" />
                                    <div className="h-3 bg-surface-200 rounded w-1/2 mb-2" />
                                    <div className="h-6 bg-surface-200 rounded w-1/3" />
                                </div>
                            ))}
                        </div>
                    ) : recommendations.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.map((rec, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-surface-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 p-5 group">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                                            {rec.category}
                                        </span>
                                        <span className="text-xs text-surface-400 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            Score: {rec.score}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-surface-800 group-hover:text-primary-600 transition-colors mb-2">
                                        {rec.name}
                                    </h3>
                                    <p className="text-xs text-surface-400 mb-3 italic">{rec.reason}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-primary-600">
                                            {formatPrice(rec.price)}
                                        </span>
                                        <Link
                                            to="/marketplace"
                                            className="px-3 py-1.5 text-xs font-medium text-white bg-accent-500 rounded-lg hover:bg-accent-600 transition-colors flex items-center gap-1"
                                        >
                                            <ShoppingBag className="w-3 h-3" />
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-surface-200 p-8 text-center">
                            <Sparkles className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                            <p className="text-surface-500 font-medium">No recommendations yet</p>
                            <p className="text-surface-400 text-sm mt-1">Start shopping to get personalized suggestions!</p>
                        </div>
                    )}
                </div>

                {/* Trending Products */}
                {trending.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-surface-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            Trending Products
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {trending.map((prod, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-surface-200 hover:shadow-md transition-all p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                            #{idx + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-surface-800 text-sm truncate">{prod.name}</h3>
                                            <p className="text-xs text-surface-400">{prod.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-primary-600">{formatPrice(prod.price)}</span>
                                        <span className="text-xs text-surface-400">{prod.score} orders</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Recommendations;
