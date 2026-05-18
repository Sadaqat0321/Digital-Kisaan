const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    rating: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    image: { type: String, default: 'https://images.unsplash.com/photo-1590156321491-bdfab87b9204?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    oldPrice: { type: Number },
    badge: { type: String },
    isOnSale: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);
