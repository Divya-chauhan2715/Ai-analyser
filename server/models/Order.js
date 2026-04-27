const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: String,
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
        },
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'completed'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'bank_transfer', 'cash', ''],
        default: '',
    },
    shippingAddress: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
