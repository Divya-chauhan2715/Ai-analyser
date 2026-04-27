const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/orders — get orders (role-filtered)
router.get('/', auth, async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'buyer') {
            filter.buyerId = req.user._id;
        } else if (req.user.role === 'business') {
            filter.sellerId = req.user._id;
        }

        const { status, paymentStatus } = req.query;
        if (status) filter.orderStatus = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const orders = await Order.find(filter)
            .populate('buyerId', 'name email')
            .populate('sellerId', 'name businessName')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('buyerId', 'name email phone')
            .populate('sellerId', 'name businessName email')
            .populate('items.productId', 'name image');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check ownership
        if (
            req.user.role !== 'admin' &&
            order.buyerId._id.toString() !== req.user._id.toString() &&
            order.sellerId._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/orders — place order (buyer)
router.post('/', auth, async (req, res) => {
    try {
        const { items, sellerId, shippingAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            // Deduct stock
            product.stock -= item.quantity;
            await product.save();

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
            });
        }

        const order = await Order.create({
            buyerId: req.user._id,
            sellerId,
            items: orderItems,
            totalAmount,
            paymentMethod: paymentMethod || '',
            shippingAddress: shippingAddress || '',
        });

        // Update or create customer record
        let customer = await Customer.findOne({
            businessId: sellerId,
            email: req.user.email,
        });

        if (customer) {
            customer.totalRevenue += totalAmount;
            customer.totalOrders += 1;
            customer.lastOrderDate = new Date();
            await customer.save();
        } else {
            await Customer.create({
                businessId: sellerId,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone || '',
                totalRevenue: totalAmount,
                totalOrders: 1,
                lastOrderDate: new Date(),
            });
        }

        const populatedOrder = await Order.findById(order._id)
            .populate('buyerId', 'name email')
            .populate('sellerId', 'name businessName');

        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/orders/:id/status — update order status (seller)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.user.role !== 'admin' && order.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.orderStatus = req.body.orderStatus;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/orders/:id/payment — update payment status (seller)
router.put('/:id/payment', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.user.role !== 'admin' && order.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.paymentStatus = req.body.paymentStatus;
        if (req.body.paymentMethod) {
            order.paymentMethod = req.body.paymentMethod;
        }
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
