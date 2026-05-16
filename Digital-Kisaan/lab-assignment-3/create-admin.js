const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/digital-kisaan-lab3').then(() => {
    console.log("Connected to MongoDB for Admin creation");
}).catch(err => {
    console.error("MongoDB connection error", err);
});

const createAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ email: 'admin@digitalkisaan.com' });
        if (existingAdmin) {
            console.log("Admin account already exists!");
            mongoose.connection.close();
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = new User({
            name: 'Super Admin',
            email: 'admin@digitalkisaan.com',
            password: hashedPassword,
            role: 'admin'
        });

        await adminUser.save();
        console.log("Admin account created successfully!");
        console.log("Email: admin@digitalkisaan.com | Password: admin123");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error creating Admin: ", error);
    }
};

createAdmin();
