const express = require('express');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// GET /api/analytics/revenue — monthly revenue for the past 12 months
router.get('/revenue', auth, role('business'), async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const revenue = await Order.aggregate([
            {
                $match: {
                    sellerId: req.user._id,
                    createdAt: { $gte: twelveMonthsAgo },
                    paymentStatus: 'paid',
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    total: { $sum: '$totalAmount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        res.json(revenue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/analytics/orders — order trends
router.get('/orders', auth, role('business'), async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const trends = await Order.aggregate([
            {
                $match: {
                    sellerId: req.user._id,
                    createdAt: { $gte: twelveMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    total: { $sum: 1 },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] },
                    },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$orderStatus', 'completed'] }, 1, 0] },
                    },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        res.json(trends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/analytics/top-products — top 10 best selling products
router.get('/top-products', auth, role('business'), async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $match: { sellerId: req.user._id } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 },
        ]);

        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/analytics/customer-growth — monthly customer growth
router.get('/customer-growth', auth, role('business'), async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const growth = await Customer.aggregate([
            {
                $match: {
                    businessId: req.user._id,
                    createdAt: { $gte: twelveMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        res.json(growth);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
