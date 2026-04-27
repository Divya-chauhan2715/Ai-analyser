import { Link } from 'react-router-dom';
import {
    TrendingUp, Package, ShoppingCart, Users, BarChart3,
    CreditCard, ArrowRight, CheckCircle2, Star, Zap,
    Shield, Globe, ChevronRight
} from 'lucide-react';

const Landing = () => {
    const features = [
        { icon: Package, title: 'Product Management', desc: 'Add, edit, and manage your entire product catalog with images, pricing, and stock levels.' },
        { icon: ShoppingCart, title: 'Order Management', desc: 'Track orders from placement to delivery with real-time status updates.' },
        { icon: Users, title: 'Customer CRM', desc: 'Build lasting relationships with customer profiles, purchase history, and insights.' },
        { icon: CreditCard, title: 'Payment Tracking', desc: 'Track payments with UPI, bank transfer, and cash support. No screenshots needed.' },
        { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Gain business insights with revenue charts, order trends, and top products.' },
        { icon: Shield, title: 'Secure Platform', desc: 'Enterprise-grade security with JWT authentication and role-based access.' },
    ];

    const steps = [
        { num: '01', title: 'Create Your Account', desc: 'Sign up as a Business or Buyer in under 2 minutes.' },
        { num: '02', title: 'Set Up Your Store', desc: 'Add products, set prices, and manage your inventory digitally.' },
        { num: '03', title: 'Start Selling', desc: 'Buyers discover your products and place bulk orders seamlessly.' },
        { num: '04', title: 'Track Everything', desc: 'Monitor orders, payments, customers, and analytics from one dashboard.' },
    ];

    const testimonials = [
        { name: 'Rajesh Kumar', role: 'Textile Manufacturer, Surat', text: 'BizConnect completely transformed how we manage orders. No more WhatsApp confusion!', rating: 5 },
        { name: 'Priya Sharma', role: 'Food Distributor, Mumbai', text: 'The inventory management alone saved us hours every week. Our stock levels are always accurate now.', rating: 5 },
        { name: 'Amit Patel', role: 'Electronics Retailer, Delhi', text: 'As a buyer, finding and ordering from manufacturers is so much easier. Love the platform!', rating: 5 },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-primary-600">BizConnect</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-surface-600 hover:text-primary-600 text-sm font-medium transition-colors">Features</a>
                            <a href="#how-it-works" className="text-surface-600 hover:text-primary-600 text-sm font-medium transition-colors">How It Works</a>
                            <a href="#testimonials" className="text-surface-600 hover:text-primary-600 text-sm font-medium transition-colors">Testimonials</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                Log In
                            </Link>
                            <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg hover:shadow-lg hover:shadow-primary-600/25 transition-all duration-300">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-accent-300 text-sm font-medium mb-6 animate-fade-in">
                            <Zap className="w-4 h-4" />
                            <span>Built for Indian SMBs</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-fade-in">
                            Your Business,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                                One Platform
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed">
                            Stop juggling WhatsApp, Excel, and UPI screenshots. BizConnect is the all-in-one B2B marketplace and order management platform for small manufacturers and distributors.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
                            <Link
                                to="/register"
                                className="group flex items-center gap-2 px-8 py-4 bg-accent-500 hover:bg-accent-400 text-white font-semibold rounded-xl shadow-xl shadow-accent-500/30 hover:shadow-accent-400/40 transition-all duration-300 text-lg"
                            >
                                Start Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="#features"
                                className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-300 text-lg border border-white/20"
                            >
                                See Features
                            </a>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { num: '500+', label: 'Businesses' },
                            { num: '10K+', label: 'Orders Processed' },
                            { num: '₹2Cr+', label: 'GMV Tracked' },
                            { num: '99.9%', label: 'Uptime' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center glass rounded-2xl p-6">
                                <div className="text-3xl lg:text-4xl font-bold text-primary-600">{stat.num}</div>
                                <div className="text-sm text-surface-500 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 bg-surface-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-accent-500 font-semibold text-sm uppercase tracking-wider">Why BizConnect</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-surface-900 mt-3">Replace 5 Tools With One</h2>
                        <p className="text-surface-500 mt-4 max-w-xl mx-auto">No more switching between WhatsApp for orders, Excel for inventory, and notebooks for customer records.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { emoji: '📱', before: 'WhatsApp Orders', after: 'Digital Order Management', color: 'from-red-500 to-orange-500' },
                            { emoji: '📊', before: 'Excel Inventory', after: 'Real-time Stock Tracking', color: 'from-blue-500 to-indigo-500' },
                            { emoji: '💰', before: 'UPI Screenshots', after: 'Payment Dashboard', color: 'from-green-500 to-emerald-500' },
                        ].map((item) => (
                            <div key={item.before} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group border border-surface-100">
                                <div className="text-4xl mb-4">{item.emoji}</div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-sm text-red-500 line-through">{item.before}</span>
                                    <ChevronRight className="w-4 h-4 text-surface-400" />
                                    <span className="text-sm font-semibold text-accent-600">{item.after}</span>
                                </div>
                                <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${item.color} group-hover:w-full transition-all duration-500`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-accent-500 font-semibold text-sm uppercase tracking-wider">Features</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-surface-900 mt-3">Everything You Need to Grow</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <div key={feature.title} className="group p-8 rounded-2xl border border-surface-100 hover:border-accent-200 hover:shadow-xl hover:shadow-accent-500/5 transition-all duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary-600/20">
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-surface-800 mb-3">{feature.title}</h3>
                                <p className="text-surface-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 bg-gradient-to-br from-primary-600 to-primary-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-accent-300 font-semibold text-sm uppercase tracking-wider">How It Works</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mt-3">Get Started in 4 Steps</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step) => (
                            <div key={step.num} className="relative group">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/20 transition-all duration-300 h-full">
                                    <span className="text-5xl font-extrabold text-accent-400/30">{step.num}</span>
                                    <h3 className="text-lg font-bold text-white mt-4 mb-3">{step.title}</h3>
                                    <p className="text-primary-200 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 bg-surface-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-accent-500 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-surface-900 mt-3">Loved by Businesses</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t) => (
                            <div key={t.name} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-surface-100">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-surface-600 mb-6 leading-relaxed italic">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-surface-800 text-sm">{t.name}</div>
                                        <div className="text-surface-400 text-xs">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-12 lg:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl" />
                        <div className="relative">
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Digitize Your Business?</h2>
                            <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
                                Join hundreds of manufacturers and distributors already using BizConnect.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-10 py-4 bg-accent-500 hover:bg-accent-400 text-white font-bold rounded-xl shadow-xl shadow-accent-500/30 transition-all duration-300 text-lg"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-surface-900 py-12 text-surface-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-white">BizConnect</span>
                        </Link>
                        <p className="text-sm">&copy; 2024 BizConnect. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
