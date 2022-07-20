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
    console.log(username, password, usertype, email, phone);
    try {
        const user = new models.User({
            username: username,
            usertype: usertype,
            password: password,
            email_address: email,
            phone_number: phone
        });
        console.log(user);
        return user.save();
    } catch (error) {
        console.error('error: ', error);
        return null;
    }
}

async function createRetailer(name, email, phone, address) {
    try {
        const retailer = new models.Retailer({
            name: name,
            email_address: email,
            phone_number: phone,
            address: address
        });
        return retailer.save();
    } catch (error) {
        console.error('error: ', error);
        return null;
    }
}

async function createDistributor(name, email, phone, address) {
    try {
        const distributor = new models.Distributor({
            name: name,
            email_address: email,
            phone_number: phone,
            address: address
        });
        return distributor.save();
    } catch (error) {
        console.error('error: ', error);
        return null;
    }
}

async function createProduct(name, id, mfg_cost, mfr, stock, mfg_cost, retail_price) {
    try {
        const product = new models.Product({
            product_name: name,
            product_id: id,
            retail_price: retail_price,
            manufacture_cost: mfg_cost,
            stock: stock,
            manufacturer: mfr
        });
        return product.save();
    } catch (error) {
        console.error('error: ', error);
        return null;
    }
}

module.exports = {
    models,
    createConnection,
    get_user,
    createUser,
    createProduct,
    createRetailer,
    createDistributor
}