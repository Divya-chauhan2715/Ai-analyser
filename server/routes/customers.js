const express = require('express');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// GET /api/customers — business's customers
router.get('/', auth, role('business'), async (req, res) => {
    try {
        const customers = await Customer.find({ businessId: req.user._id })
            .sort({ lastOrderDate: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/customers/:id — single customer with order history
router.get('/:id', auth, role('business'), async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        if (customer.businessId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Fetch order history for this customer
        const orders = await Order.find({
            sellerId: req.user._id,
            buyerId: { $exists: true },
        }).populate('buyerId', 'name email');

        // Filter orders by customer email match
        const customerOrders = orders.filter(
            o => o.buyerId && o.buyerId.email === customer.email
        );

        res.json({ customer, orders: customerOrders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/customers — add customer manually
router.post('/', auth, role('business'), async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const customer = await Customer.create({
            businessId: req.user._id,
            name,
            email: email || '',
            phone: phone || '',
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/customers/:id
router.put('/:id', auth, role('business'), async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        if (customer.businessId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
