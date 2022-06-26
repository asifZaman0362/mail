const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ 
    username: String, 
    password: String, 
    phone_number: String,
    email_address: String, 
    user_type: String 
});

const retailerSchema = new mongoose.Schema({
    name: String,
    address: String,
    phone_number: String,
    email_address: String
});

const distributorSchema = new mongoose.Schema({
    name: String,
    address: String,
    phone_number: String,
    email_address: String
});

const productSchema = new mongoose.Schema({
    product_id: Number,
    product_name: String,
    manufacture_cost: Number,
    retail_price: Number,
    manufacturer: String,
    batch_number: String,
    mfg_date: Date,
    stock: Number
});

const models = {
    User: mongoose.Model('User', userSchema),
    Distributor: mongoose.Model('Distributor', distributorSchema),
    Retailer: mongoose.Model('Retailer', retailerSchema),
    Product: mongoose.Model('Product', productSchema)
};

async function createConnection() {
    return mongoose.connect('mongodb://localhost:27017');
}

async function get_user(username, user_type) {
    return models.User.findOne({ username: username, user_type: user_type });
}