const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');

const Product = require('./models/Product');
const User = require('./models/User');
const { isLoggedIn, isAdmin } = require('./middlewares/auth');

const app = express();
const port = 3000;

// Connect to MongoDB
const MONGO_URI = 'mongodb://localhost:27017/digital-kisaan-lab3';
mongoose.connect(MONGO_URI).then(() => {
    console.log("Connected to MongoDB for Lab 3");
}).catch(err => {
    console.error("MongoDB connection error", err);
});

// Setup EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Configuration
app.use(session({
    secret: 'supersecret_session_key_99',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Flash Messages Middleware
app.use(flash());

// Global Variables for Views
app.use((req, res, next) => {
    res.locals.user = req.session.userId ? { id: req.session.userId, name: req.session.userName, role: req.session.role } : null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, 'product-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// -----------------
// AUTH ROUTES
// -----------------
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        // Setup Session
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.role = user.role;

        req.flash('success', `Welcome back, ${user.name}!`);
        if (user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/products');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred during login.');
        res.redirect('/login');
    }
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validation
        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters long.');
            return res.redirect('/register');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email is already in use.');
            return res.redirect('/register');
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'customer' // Default role
        });

        await newUser.save();
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred during registration.');
        res.redirect('/register');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        res.redirect('/login');
    });
});

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
// ADMIN ROUTES (CRUD protected by isAdmin)
// -----------------

// Secure Checkout Route (Protected by isLoggedIn)
app.get('/checkout', isLoggedIn, (req, res) => {
    res.render('checkout', { title: 'Digital Kisaan - Secure Checkout' });
});

// Apply isAdmin middleware to all routes starting with /admin
app.use('/admin', isAdmin);

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
        
        let imagePath = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        if (req.file) {
            imagePath = '/uploads/' + req.file.filename;
        }

        const newProduct = new Product({
            name, price, category, stock, oldPrice: oldPrice || null, badge, image: imagePath
        });

        await newProduct.save();
        req.flash('success', 'Product added successfully.');
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error adding product.');
        res.redirect('/admin');
    }
});

// Edit Product - Form
app.get('/admin/products/edit/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error', 'Product not found.');
            return res.redirect('/admin');
        }
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
        req.flash('success', 'Product updated successfully.');
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error updating product.');
        res.redirect('/admin');
    }
});

// Delete Product
app.post('/admin/products/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success', 'Product deleted successfully.');
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error deleting product.');
        res.redirect('/admin');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
