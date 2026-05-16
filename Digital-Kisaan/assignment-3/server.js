const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/digital-kisaan-assignment3').then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB connection error", err);
});

// Set EJS as templating engine
app.set('view engine', 'ejs');
// Serve static files from 'public' folder
app.use(express.static('public'));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Digital Kisaan - Home' });
});

// Dynamic Products Route with Pagination, Filtering and Searching
app.get('/products', async (req, res) => {
    try {
        let { page, search, category, minPrice, maxPrice } = req.query;

        // Settings for pagination
        page = parseInt(page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        // Build Query Object
        let query = {};

        // 1. Searching (by name)
        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        // 2. Category Filtering
        if (category && category !== 'All') {
            query.category = category;
        }

        // 3. Price Filtering
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Fetch Total Count for Pagination calculation
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        // Fetch Products Data
        const products = await Product.find(query)
                                      .skip(skip)
                                      .limit(limit);

        // Render the view with retrieved data
        res.render('products', {
            title: 'Digital Kisaan - Marketplace',
            products,
            currentPage: page,
            totalPages,
            search: search || '',
            category: category || 'All',
            minPrice: minPrice || '',
            maxPrice: maxPrice || ''
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
