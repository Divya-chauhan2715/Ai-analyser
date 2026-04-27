const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// GET /api/admin/users — all users
router.get('/users', auth, role('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/users/:id/verify
router.put('/users/:id/verify', auth, role('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/users/:id/suspend
router.put('/users/:id/suspend', auth, role('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isSuspended = !user.isSuspended;
        await user.save();

        res.json({ message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'}`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/admin/products/:id/approve
router.put('/products/:id/approve', auth, role('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/admin/products/pending — unapproved products
router.get('/products/pending', auth, role('admin'), async (req, res) => {
    try {
        const products = await Product.find({ isApproved: false })
            .populate('sellerId', 'name businessName')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/admin/stats — platform-wide statistics
router.get('/stats', auth, role('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBusinesses = await User.countDocuments({ role: 'business' });
        const totalBuyers = await User.countDocuments({ role: 'buyer' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingVerifications = await User.countDocuments({ role: 'business', isVerified: false });
        const pendingApprovals = await Product.countDocuments({ isApproved: false });

        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);

        res.json({
            totalUsers,
            totalBusinesses,
            totalBuyers,
            totalProducts,
            totalOrders,
            pendingVerifications,
            pendingApprovals,
            totalRevenue: revenueResult[0]?.total || 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
