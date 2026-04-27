const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0,
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: 0,
        default: 0,
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
    },
    image: {
        type: String,
        default: '',
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
