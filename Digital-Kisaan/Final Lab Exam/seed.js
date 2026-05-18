const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/digital-kisaan-lab4').then(() => {
    console.log("Connected to MongoDB for seeding Final Lab Exam");
}).catch(err => {
    console.error("MongoDB connection error", err);
});

const generateProducts = () => {
    const categories = ['Seeds', 'Fertilizer', 'Tools', 'Crops', 'Machinery'];
    const products = [];
    
    // Seed exactly 50 products so pagination operates beautifully on all interfaces!
    for (let i = 1; i <= 50; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        let image = '';
        if (cat === 'Seeds') image = 'https://images.unsplash.com/photo-1615485925763-8678628890aca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        else if (cat === 'Fertilizer') image = 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        else if (cat === 'Tools') image = 'https://images.unsplash.com/photo-1590156321491-bdfab87b9204?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        else if (cat === 'Crops') image = 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        else image = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';

        const basePrice = Math.floor(Math.random() * 5000) + 100;
        const hasOldPrice = Math.random() > 0.5;
        const oldPrice = hasOldPrice ? basePrice + Math.floor(Math.random() * 1000) + 150 : null;
        
        // 25 products with isOnSale: true (enough for 3 pages of client-side 10-item pagination!)
        // 25 products with isOnSale: false
        const isOnSale = i <= 25;
        const badge = isOnSale ? 'Sale' : (Math.random() > 0.8 ? 'Best Seller' : null);
        
        products.push({
            name: `${cat} ${isOnSale ? 'On-Sale' : 'Premium'} Product ${i}`,
            price: basePrice,
            oldPrice: isOnSale ? oldPrice || basePrice + 300 : oldPrice,
            category: cat,
            rating: parseFloat((Math.random() * 1.8 + 3.2).toFixed(1)), // Rating between 3.2 and 5.0
            stock: Math.floor(Math.random() * 120) + 5,
            image: image,
            badge: badge,
            isOnSale: isOnSale
        });
    }
    return products;
};

const seedDB = async () => {
    try {
        await Product.deleteMany({});
        console.log("Existing products in digital-kisaan-lab4 cleared.");
        
        const sampleProducts = generateProducts();
        await Product.insertMany(sampleProducts);
        console.log(`✅ Database successfully seeded with ${sampleProducts.length} products (25 On-Sale, 25 regular)!`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};

seedDB();
