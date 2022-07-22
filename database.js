const mongoose = require('mongoose');
const uuid = require('uuid');

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

const purchaseSchema = new mongoose.Schema({
    purchase_id: String,
    product_id: Number,
    quantity: Number,
    rate: Number,
    discount: Number,
    price: Number,
    transaction_id: Number
});

const transactionSchema = new mongoose.Schema({
    transaction_id: String,
    purchase_id: Array,
    seller_id: Number,
    buyer_id: Number,
    cost: Number,
    date: Date
});

const models = {
    User: mongoose.model('User', userSchema),
    Distributor: mongoose.model('Distributor', distributorSchema),
    Retailer: mongoose.model('Retailer', retailerSchema),
    Product: mongoose.model('Product', productSchema),
    Purchase: mongoose.model('Purchase', purchaseSchema),
    Transaction: mongoose.model('Transaction', transactionSchema)
};

async function createConnection() {
    return mongoose.connect('mongodb://localhost:27017');
}

async function get_user(username, usertype) {
    return models.User.findOne({ username: username, usertype: usertype });
}

async function createPurchase(product_id, quantity, discount, rate, price, transaction_id) {
    const id = uuid.v5();
    const purchase = new models.Purchase({
        purchase_id: id,
        product_id: product_id,
        quantity: quantity,
        discount: discount,
        rate: rate,
        price: price,
        transaction_id: transaction_id
    });
    return purchase.save();
}

async function createTransaction(seller, buyer, cost, date) {
    const id = uuid.v5();
    const transaction = new models.Transaction({
        transaction_id: id,
        seller_id: seller,
        buyer_id: buyer,
        cost: cost,
        date: date
    });
    return transaction.save();
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

async function createProduct(name, id, mfg_cost, mfr, stock, retail_price) {
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