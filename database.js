const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ 
    username: String, 
    password: String, 
    phone_number: String,
    email_address: String, 
    usertype: String 
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
    User: mongoose.model('User', userSchema),
    Distributor: mongoose.model('Distributor', distributorSchema),
    Retailer: mongoose.model('Retailer', retailerSchema),
    Product: mongoose.model('Product', productSchema)
};

async function createConnection() {
    return mongoose.connect('mongodb://localhost:27017');
}

async function get_user(username, usertype) {
    return models.User.findOne({ username: username, usertype: usertype });
}

async function createUser(username, usertype, password, email, phone) {
    try {
        const user = new models.User({
            username,
            usertype,
            password,
            email,
            phone
        });
        return user.save();
    } catch (error) {
        console.error('error: ', error);
        return null;
    }
}

module.exports = {
    models,
    createConnection,
    get_user
}