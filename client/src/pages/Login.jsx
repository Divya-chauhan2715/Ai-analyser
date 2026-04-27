import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'business') navigate('/dashboard');
            else navigate('/marketplace');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
                </div>
                <div className="relative flex flex-col justify-center px-16">
                    <Link to="/" className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-accent-500 rounded-2xl flex items-center justify-center shadow-xl">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white">BizConnect</span>
                    </Link>
                    <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Welcome back to your business hub
                    </h2>
                    <p className="text-primary-200 text-lg leading-relaxed">
                        Manage products, orders, inventory, and customers — all in one place.
                    </p>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-primary-600">BizConnect</span>
                    </div>

                    <h1 className="text-3xl font-bold text-surface-900 mb-2">Sign In</h1>
                    <p className="text-surface-500 mb-8">Enter your credentials to access your account</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@business.com"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all bg-white"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-600/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-surface-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
