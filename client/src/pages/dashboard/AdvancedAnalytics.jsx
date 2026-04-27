import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import {
    BarChart3, TrendingUp, Users, Lightbulb, Target, RefreshCw,
    ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Package
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ML_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5002';

const COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6', '#F97316'];

const AdvancedAnalytics = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAll();
    }, [user]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const sellerId = user?.role === 'business' ? user.id : '';
            const [analyticsRes, predictionsRes] = await Promise.all([
                fetch(`${ML_API}/api/ml/analytics/advanced${sellerId ? `?sellerId=${sellerId}` : ''}`),
                fetch(`${ML_API}/api/ml/predictions/sales${sellerId ? `?sellerId=${sellerId}` : ''}`)
            ]);
            const analyticsData = await analyticsRes.json();
            const predictionsData = await predictionsRes.json();
            setAnalytics(analyticsData);
            setPredictions(predictionsData);
            setError(null);
        } catch (err) {
            setError('Analytics service is not running. Start it with: python analytics-service/app.py');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val?.toFixed(0) || 0}`;
    };

    const getInsightColor = (type) => {
        const map = { success: 'green', info: 'blue', warning: 'amber', danger: 'red' };
        return map[type] || 'blue';
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-surface-500 font-medium">Loading ML Analytics...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                            <BarChart3 className="w-7 h-7 text-primary-600" />
                            Advanced Analytics
                        </h1>
                        <p className="text-surface-500 mt-1">
                            ML-powered business insights and sales predictions
                        </p>
                    </div>
                    <button
                        onClick={fetchAll}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Data
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-amber-800 text-sm font-medium">⚠️ {error}</p>
                    </div>
                )}

                {analytics && (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <KPICard icon={DollarSign} label="Total Revenue" value={formatCurrency(analytics.overview?.total_revenue || 0)} color="blue" />
                            <KPICard icon={ShoppingCart} label="Total Orders" value={analytics.overview?.total_orders || 0} color="green" />
                            <KPICard icon={Users} label="Customers" value={analytics.overview?.total_customers || 0} color="purple" />
                            <KPICard icon={Package} label="Avg Order Value" value={formatCurrency(analytics.overview?.avg_order_value || 0)} color="amber" />
                        </div>

                        {/* Sales Trend + Prediction */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 p-6">
                                <h2 className="text-lg font-bold text-surface-800 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary-600" />
                                    Revenue Trend & Forecast
                                </h2>
                                {predictions && !predictions.error && (
                                    <>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={[
                                                ...predictions.historical.map(d => ({ ...d, type: 'actual' })),
                                                ...predictions.predictions.map(d => ({ ...d, revenue: null, predicted: d.revenue, type: 'forecast' }))
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                                                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                                <Legend />
                                                <Area type="monotone" dataKey="revenue" name="Actual" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} strokeWidth={2} />
                                                <Area type="monotone" dataKey="predicted" name="Forecast" stroke="#EC4899" fill="#EC4899" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                        <div className="flex items-center gap-4 mt-3 text-sm">
                                            <span className={`flex items-center gap-1 font-medium ${predictions.trend === 'growing' ? 'text-green-600' : 'text-red-600'}`}>
                                                {predictions.trend === 'growing' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                {predictions.trend === 'growing' ? 'Growing' : 'Declining'} trend
                                            </span>
                                            <span className="text-surface-400">
                                                Model R²: {(predictions.model_score * 100).toFixed(0)}%
                                            </span>
                                            <span className="text-surface-400">
                                                Monthly change: {formatCurrency(Math.abs(predictions.monthly_growth))}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Category Performance Pie */}
                            <div className="bg-white rounded-2xl border border-surface-200 p-6">
                                <h2 className="text-lg font-bold text-surface-800 mb-4">Category Split</h2>
                                {analytics.category_performance && (
                                    <>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={analytics.category_performance}
                                                    dataKey="revenue"
                                                    nameKey="category"
                                                    cx="50%" cy="50%"
                                                    innerRadius={50} outerRadius={80}
                                                    paddingAngle={3}
                                                >
                                                    {analytics.category_performance.map((_, i) => (
                                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={formatCurrency} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="space-y-2 mt-2">
                                            {analytics.category_performance.map((cat, i) => (
                                                <div key={cat.category} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                                        <span className="text-surface-600 truncate">{cat.category}</span>
                                                    </div>
                                                    <span className="font-medium text-surface-800">{cat.revenue_pct}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Top Products + Customer Segments */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Products */}
                            <div className="bg-white rounded-2xl border border-surface-200 p-6">
                                <h2 className="text-lg font-bold text-surface-800 mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-accent-500" />
                                    Top Products by Revenue
                                </h2>
                                {analytics.top_products && (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics.top_products.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                                            <YAxis type="category" dataKey="product_name" width={130} tick={{ fontSize: 10 }} />
                                            <Tooltip formatter={formatCurrency} />
                                            <Bar dataKey="revenue" fill="#6366F1" radius={[0, 6, 6, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Customer Segments */}
                            <div className="bg-white rounded-2xl border border-surface-200 p-6">
                                <h2 className="text-lg font-bold text-surface-800 mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-green-500" />
                                    Customer Segments
                                </h2>
                                {analytics.customer_segments && (
                                    <div className="space-y-3">
                                        {analytics.customer_segments.map((seg, i) => {
                                            const segColors = {
                                                'VIP': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
                                                'Loyal': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                                                'Recent': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                                                'Regular': { bg: 'bg-surface-50', text: 'text-surface-700', border: 'border-surface-200' },
                                                'At Risk': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
                                            };
                                            const colors = segColors[seg.segment] || segColors['Regular'];
                                            return (
                                                <div key={seg.segment} className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`font-bold ${colors.text}`}>{seg.segment}</span>
                                                        <span className="text-sm text-surface-500">{seg.count} customers</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-surface-400">Avg Spend:</span>
                                                            <span className="font-medium ml-1">{formatCurrency(seg.avg_spend)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-surface-400">Avg Orders:</span>
                                                            <span className="font-medium ml-1">{seg.avg_frequency}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Business Insights */}
                        {analytics.insights && analytics.insights.length > 0 && (
                            <div className="bg-white rounded-2xl border border-surface-200 p-6">
                                <h2 className="text-lg font-bold text-surface-800 mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                    AI Business Insights
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {analytics.insights.map((insight, i) => {
                                        const color = getInsightColor(insight.type);
                                        return (
                                            <div key={i} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4`}>
                                                <h3 className={`font-semibold text-${color}-700 text-sm mb-1`}>{insight.title}</h3>
                                                <p className={`text-${color}-600 text-sm`}>{insight.text}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Monthly Trends Bar */}
                        {analytics.monthly_trends && (
                            <div className="bg-white rounded-2xl border border-surface-200 p-6">
                                <h2 className="text-lg font-bold text-surface-800 mb-4">Monthly Order Volume</h2>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={analytics.monthly_trends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="orders" name="Orders" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="quantity" name="Quantity Sold" fill="#10B981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

const KPICard = ({ icon: Icon, label, value, color }) => {
    const colorMap = {
        blue: 'from-blue-500 to-indigo-600',
        green: 'from-emerald-500 to-green-600',
        purple: 'from-purple-500 to-violet-600',
        amber: 'from-amber-500 to-orange-600',
    };

    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/80">{label}</span>
                <Icon className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
};

export default AdvancedAnalytics;
