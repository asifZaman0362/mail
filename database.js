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
    product_id: String,
    product_name: String,
    manufacture_cost: Number,
    retail_price: Number,
    manufacturer: String,
    stock: Number
});

const purchaseSchema = new mongoose.Schema({
    purchase_id: String,
    product_id: Number,
    product_name: String,
    quantity: Number,
    rate: Number,
    discount: Number,
    price: Number,
    transaction_id: String
});

const transactionSchema = new mongoose.Schema({
    transaction_id: String,
    seller: String,
    buyer: String,
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

async function createPurchase(product_id, quantity, discount, transaction_id) {
    const id = uuid.v4();
    const prod = await models.Product.findOne({product_id: product_id});
    if (!prod) {
        return null;
    }
    let cost = prod.retail_price * quantity;
    let d = discount / 100;
    const purchase = new models.Purchase({
        purchase_id: id,
        product_id: product_id,
        product_name: prod.product_name,
        quantity: quantity,
        discount: discount,
        rate: prod.retail_price,
        price: (prod.retail_price - (prod.retail_price * discount / 100)) * quantity,
        transaction_id: transaction_id
    });
    return purchase.save();
}

async function createTransaction(seller, buyer, cost, date) {
    const id = uuid.v4();
    const transaction = new models.Transaction({
        transaction_id: id,
        seller: seller,
        buyer: buyer,
        cost: cost,
        date: date
    });
    if (await transaction.save()) return id;
    else return null;
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

async function get_purchases_by_transaction(id) {
    return models.Purchase.find({transaction_id: id});
}

async function get_distributor_by_name(name) {
    return models.Distributor.findOne({name: name});
}

async function get_retailer_by_name(name) {
    return models.Retailer.findOne({name: name});
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
            product_id: id,
            product_name: name,
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

async function get_products() {
    try {
        return await models.Product.find();
    } catch (err) {
        console.error(err);
    }
}

async function get_product_by_id(id) {
    try {
        return await models.Product.findOne({ product_id: id });
    } catch (err) {
        console.error(err);
    }
}

async function get_distributors() {
    try {
        return await models.Distributor.find();
    } catch (err) {
        console.error(err);
    }
}

async function get_retailers() {
    try {
        return await models.Retailer.find();
    } catch (err) {
        console.error(err);
    }
}

async function get_users() {
    try {
        return await models.User.find();
    } catch (err) {
        console.error(err);
    }
}

async function get_bill(id) {
    let purchases_list;
    try {
        purchases_list = []
        const {purchases, transaction} = await get_transaction_by_id(id);
        for (purchase of purchases) {
            const product = models.Product.findOne({product_id: purchase.product_id});
            purchases_list.append({
                product_id: purchase.product_id,
                product_name: product.product_name,
                purchase_id: purchase.purchase_id,
                quantity: purchase.quantity,
                rate: purchase.rate,
                price: purchase.price,
                discount: purchase.discount
            });
        }
        return {purchases: purchases_list, transaction: transaction};
    } catch (err) {
        console.error(err);
    }
}

async function get_transactions() {
    try {
        return await models.Transaction.find();
    } catch (err) {
        console.error(err);
    }
}

async function get_transaction_by_id(id) {
    try {
        const purchases = await models.Purchase.find({ transaction_id: id });
        const transaction = await models.Transaction.findOne({ transaction_id: id });
        console.log(id, transaction);
        return {
            purchases: purchases,
            transaction: transaction
        };
    } catch (err) {
        console.error(err);
    }
}

async function drop_database() {
    try {
        models.Product.drop();
        models.Distributor.drop();
        models.Retailer.drop();
        models.Transaction.drop();
        models.Purchase.drop();
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    models,
    createConnection,
    get_user,
    get_products,
    get_product_by_id,
    get_retailers,
    get_distributors,
    createUser,
    createProduct,
    createRetailer,
    createDistributor,
    createTransaction,
    get_transactions,
    get_transaction_by_id,
    drop_database,
    get_bill,
    createPurchase,
    get_purchases_by_transaction,
    get_retailer_by_name,
    get_distributor_by_name
}