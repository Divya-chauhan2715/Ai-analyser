const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
    },
    email: {
        type: String,
        default: '',
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        default: '',
    },
    totalRevenue: {
        type: Number,
        default: 0,
    },
    totalOrders: {
        type: Number,
        default: 0,
    },
    lastOrderDate: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Customer', customerSchema);
