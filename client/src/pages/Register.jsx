import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, ArrowRight, Building2, ShoppingBag } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role) { setError('Please select a role'); return; }
        setError('');
        setLoading(true);
        try {
            const user = await register(name, email, password, role);
            if (user.role === 'business') navigate('/dashboard');
            else navigate('/marketplace');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
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
                        Start your digital business journey
                    </h2>
                    <p className="text-primary-200 text-lg leading-relaxed">
                        Join hundreds of businesses already streamlining their operations with BizConnect.
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-primary-600">BizConnect</span>
                    </div>

                    <h1 className="text-3xl font-bold text-surface-900 mb-2">Create Account</h1>
                    <p className="text-surface-500 mb-8">Fill in your details to get started</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-3">I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('business')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${role === 'business'
                                            ? 'border-primary-600 bg-primary-50 shadow-md shadow-primary-600/10'
                                            : 'border-surface-200 hover:border-surface-300 bg-white'
                                        }`}
                                >
                                    <Building2 className={`w-8 h-8 ${role === 'business' ? 'text-primary-600' : 'text-surface-400'}`} />
                                    <span className={`text-sm font-semibold ${role === 'business' ? 'text-primary-600' : 'text-surface-600'}`}>Business / Seller</span>
                                    <span className="text-xs text-surface-400">Manufacturer or distributor</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('buyer')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${role === 'buyer'
                                            ? 'border-accent-500 bg-accent-50 shadow-md shadow-accent-500/10'
                                            : 'border-surface-200 hover:border-surface-300 bg-white'
                                        }`}
                                >
                                    <ShoppingBag className={`w-8 h-8 ${role === 'buyer' ? 'text-accent-600' : 'text-surface-400'}`} />
                                    <span className={`text-sm font-semibold ${role === 'buyer' ? 'text-accent-600' : 'text-surface-600'}`}>Buyer / Retailer</span>
                                    <span className="text-xs text-surface-400">Retail store or reseller</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    id="register-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    id="register-email"
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
                                    id="register-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-surface-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all bg-white"
                                    required
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-600/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-surface-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
