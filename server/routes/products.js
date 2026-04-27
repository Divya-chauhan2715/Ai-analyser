const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/products — public marketplace listing (only approved products)
router.get('/', async (req, res) => {
    try {
        const { category, search, sellerId } = req.query;
        const filter = { isApproved: true };

        if (category) filter.category = category;
        if (sellerId) filter.sellerId = sellerId;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const products = await Product.find(filter)
            .populate('sellerId', 'name businessName')
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/products/my — seller's own products
router.get('/my', auth, role('business'), async (req, res) => {
    try {
        const products = await Product.find({ sellerId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/products/categories — unique categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isApproved: true });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'name businessName email');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/products — create product (business only)
router.post('/', auth, role('business'), async (req, res) => {
    try {
        const { name, description, price, stock, category, image } = req.body;
        const product = await Product.create({
            name,
            description,
            price,
            stock,
            category,
            image: image || '',
            sellerId: req.user._id,
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/products/upload — upload image to Cloudinary
router.post('/upload', auth, role('business'), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'bizconnect/products',
        });

        res.json({ url: result.secure_url, public_id: result.public_id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/products/:id — update product (owner only)
router.put('/:id', auth, role('business'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/products/:id — delete product (owner only)
router.delete('/:id', auth, role('business'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
