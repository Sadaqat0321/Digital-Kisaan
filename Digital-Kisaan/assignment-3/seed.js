const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/digital-kisaan-assignment3').then(() => {
    console.log("Connected to MongoDB for seeding");
}).catch(err => {
    console.error("MongoDB connection error", err);
});

const generateProducts = () => {
    const categories = ['Seeds', 'Fertilizer', 'Tools', 'Crops', 'Machinery'];
    const products = [];
    
    // Seed at least 30 products to easily test pagination (8 per page -> 4 pages)
    for (let i = 1; i <= 30; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        let image = '';
        if (cat === 'Seeds') image = 'https://images.unsplash.com/photo-1615485925763-8678628890aca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        else if (cat === 'Fertilizer') image = 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        else if (cat === 'Tools') image = 'https://images.unsplash.com/photo-1590156321491-bdfab87b9204?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        else if (cat === 'Crops') image = 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        else image = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';

        const basePrice = Math.floor(Math.random() * 5000) + 100;
        const oldPrice = Math.random() > 0.7 ? basePrice + Math.floor(Math.random() * 500) : null;
        
        products.push({
            name: `${cat} Product ${i}`,
            price: basePrice,
            oldPrice: oldPrice,
            category: cat,
            rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0 and 5.0
            stock: Math.floor(Math.random() * 100) + 1,
            image: image,
            badge: Math.random() > 0.8 ? 'Sale' : (Math.random() > 0.8 ? 'Best Seller' : null)
        });
    }
    return products;
};

const seedDB = async () => {
    try {
        await Product.deleteMany({});
        console.log("Collections cleared.");
        const sampleProducts = generateProducts();
        await Product.insertMany(sampleProducts);
        console.log("Database seeded successfully with", sampleProducts.length, "products!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding DB: ", error);
    }
};

seedDB();
