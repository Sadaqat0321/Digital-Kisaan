const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('./models/Product');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/digital-kisaan-assignment4').then(() => {
    console.log("Connected to MongoDB for Assignment 4");
}).catch(err => {
    console.error("MongoDB connection error", err);
});

// Setup EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, 'product-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// -----------------
// PUBLIC ROUTES
// -----------------
app.get('/', (req, res) => {
    res.render('index', { title: 'Digital Kisaan - Home' });
});

// Dynamic Products Route with Pagination, Filtering and Searching
app.get('/products', async (req, res) => {
    try {
        let { page, search, category, minPrice, maxPrice } = req.query;
        page = parseInt(page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;
        let query = {};

        if (search) query.name = { $regex: search, $options: 'i' };
        if (category && category !== 'All') query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        const products = await Product.find(query).skip(skip).limit(limit);

        res.render('products', {
            title: 'Digital Kisaan - Marketplace',
            products,
            currentPage: page, totalPages,
            search: search || '', category: category || 'All',
            minPrice: minPrice || '', maxPrice: maxPrice || ''
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server Error");
    }
});

// -----------------
// ADMIN ROUTES (CRUD)
// -----------------

// Admin Dashboard - View all products
app.get('/admin', async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 });
        res.render('admin/dashboard', { title: 'Admin Dashboard', products });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Add Product - Form
app.get('/admin/products/new', (req, res) => {
    res.render('admin/product-form', { title: 'Add New Product', product: new Product(), action: '/admin/products/new' });
});

// Add Product - POST Action
app.post('/admin/products/new', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, stock, oldPrice, badge } = req.body;
        
        let imagePath = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'; // fallback
        if (req.file) {
            imagePath = '/uploads/' + req.file.filename;
        }

        const newProduct = new Product({
            name, price, category, stock, oldPrice: oldPrice || null, badge, image: imagePath
        });

        await newProduct.save();
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding product");
    }
});

// Edit Product - Form
app.get('/admin/products/edit/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("Product not found");
        res.render('admin/product-form', { title: 'Edit Product', product, action: `/admin/products/edit/${product._id}` });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Edit Product - POST Action
app.post('/admin/products/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, stock, oldPrice, badge } = req.body;
        const product = await Product.findById(req.params.id);
        
        if (!product) return res.status(404).send("Product not found");

        product.name = name;
        product.price = price;
        product.category = category;
        product.stock = stock;
        product.oldPrice = oldPrice || null;
        product.badge = badge;
        
        if (req.file) {
            product.image = '/uploads/' + req.file.filename;
        }

        await product.save();
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating product");
    }
});

// Delete Product
app.post('/admin/products/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting product");
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
