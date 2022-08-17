const express = require('express');
const session = require('express-session');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const database = require('./database');
const auth = require('./auth');

require('dotenv').config();
const app = express();
database.createConnection();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: '6HBnWF56qv@nME'
}));

app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
    try {
        let token = '';
        if (req.cookies['jsonwebtoken'])
            token = req.cookies['jsonwebtoken'];
        console.log('token: ', token);
        const accessLevel = await auth.getAccessLevel(token);
        req.session.user = 'user';
        req.session.usertype = accessLevel;
        req.session.success = "Successfully logged in as <b>" + 'user' + "</b>!";
        console.log(req.session.usertype);
        if (!accessLevel) return res.status(401).redirect('/login');
        else if (accessLevel === "admin") {
            return res.status(200).redirect('/admin');
        } else {
            return res.status(200).redirect('/editor');
        }
    } catch (error) {
        console.error(error);
        return res.status(401).redirect('/login');
    }
});

app.get('/login', (req, res) => {
    return res.status(200).render('login');
});

app.get('/register', (req, res) => {
    return res.status(200).render('register');
})

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const usertype = req.body.usertype;
    const password = await auth.getPasswordHash(req.body.password);
    const phone = req.body.phone;
    const email = req.body.email;
    if (await database.get_user(username, usertype)) {
        console.log('user already exists!');
        return res.status(409).redirect('/register?code=409');
    } else {
        if (await database.createUser(username, usertype, password, email, phone)) {
            console.log('user created sucessfully');
            return res.status(200).redirect('/login');
        }
        else return res.status(500).redirect('/register?code=500');
    }
});

app.get('/editor', auth.is_editor, async (req, res) => {
    return res.render('editor.pug', {username: req.session.username, usertype: req.session.usertype});
});

app.get('/admin', auth.is_editor, async (req, res) => {
    return res.render('editor.pug', {username: req.session.username, usertype: req.session.usertype});
});

app.get('/add_product', auth.is_editor, async (req, res) => {
    return res.render('add_product.pug', {username: req.session.username, usertype: req.session.usertype});
});

app.get('/add_retailer', auth.is_editor, async (req, res) => {
    return res.render('addretailer.pug', {username: req.session.username, usertype: req.session.usertype});
});

app.get('/add_distributor', auth.is_editor, async (req, res) => {
    return res.render('add_distributor.pug', {username: req.session.username, usertype: req.session.usertype});
});

app.post('/add_distributor', auth.is_editor, async (req, res) => {
    let name = req.body.name;
    let address = req.body.address;
    let email = req.body.email;
    let phone = req.body.phone;
    let result = await database.createDistributor(name, email, phone, address);
    if (result != null) {
        console.log('Added distributor: ', result);
        return res.status(200).redirect('/admin');
    }
});

app.post('/add_retailer', auth.is_editor, async (req, res) => {
    let name = req.body.name;
    let address = req.body.address;
    let email = req.body.email;
    let phone = req.body.phone;
    let result = await database.createRetailer(name, email, phone, address);
    if (result != null) {
        console.log('Added retailer: ', result);
        return res.status(200).redirect('/admin');
    }
});

app.post('/add_product', auth.is_editor, async (req, res) => {
    let name = req.body.name;
    let id = req.body.id;
    let cost = req.body.manufacturing_cost;
    let price = req.body.retail_price;
    let stock = req.body.stock;
    let mname = req.body.manufacturer_name;
    let result = await database.createProduct(name, id, cost, mname, stock, price);
    if (result != null) {
        console.log('Added product: ', result);
        return res.status(200).redirect('/admin');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('jsonwebtoken');
    req.session.destroy();
    return res.status(200).redirect('/login');
});

app.get('/list_product', auth.is_editor, async (req, res) => {
    let products = await database.get_products();
    return res.status(200).render('list_product.pug', {products: products, username: req.session.username, usertype: req.session.usertype});
});

app.get('/list_retailer', auth.is_editor, async (req, res) => {
    let retailers = await database.get_retailers();
    return res.status(200).render('list_retailer.pug', {retailers: retailers, username: req.session.username, usertype: req.session.usertype});
});

app.get('/list_distributor', auth.is_editor, async (req, res) => {
    let distributors = await database.get_distributors();
    return res.status(200).render('list_distributor.pug', {distributors: distributors, username: req.session.username, usertype: req.session.usertype});
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const usertype = req.body.usertype;
    const password = req.body.password;
    if (await auth.verifyPassword(username, usertype, password)) {
        let token = await auth.generateToken(username, usertype);
        res.cookie('jsonwebtoken', token, { maxAge: 60*60*24*60, httpOnly: true });
        console.log(res.cookies, token);
        console.log('logged in');
        return res.status(200).redirect('/');
    } else {
        return res.status(401).redirect('/login?code=401');
    }
});

app.post('/add_retailer', auth.is_editor, async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    await database.createRetailer(name, email, phone, address);
    return res.status(200).redirect('/editor');
});

app.post('/add_distributor', auth.is_editor, async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    await database.createDistributor(name, email, phone, address);
    return res.status(200).redirect('/editor');
});

app.post('/add_product', auth.is_editor, async (req, res) => {
    const name = req.body.name;
    const id = req.body.id;
    const mfg_cost = req.body.manufacturing_cost;
    const mfr = req.body.manufacturer_name;
    const price = req.body.retail_price;
    const stock = req.body.stock;
    await database.createProduct(name, id, mfg_cost, mfr, stock, price);
    return res.status(200).redirect('/editor');
});

app.get('/list_transaction', auth.is_editor, async (req, res) => {
    const list = await database.get_transactions();
    return res.status(200).render('list_transaction.pug', {transactions: list, username: req.session.username, usertype: req.session.usertype});
});

app.get('/add_transaction', auth.is_editor, async (req, res) => {
    return res.status(200).render('add_transaction.pug');
});

app.get('/view_transaction', auth.is_editor, async (req, res) => {
    const id = req.body.id;
    const transaction = await database.get_transaction_by_id(id);
    res.status(200).render('transaction_view.pug', { transaction: transaction, username: req.session.username, usertype: req.session.usertype });
});

app.get('*', (req, res) => {
    return res.status(404).render('404', { title: '404: Page not found!', username: req.session.username, usertype: req.session.usertype });
});

app.post('/add_transaction', auth.is_editor, async (req, res) => {
    const productids = req.ids.split(';');
    const quantities = req.quantities.split(';');
    const discounts = req.discounts.split(';');
    let purchases = [];
    let totalPrice = 0;
    let totalCost = 0;
    for (let i = 0; i < productids.length; i++) {
        const prod = database.get_product_by_id(productids[i]);
        const rate = prod.retail_price;
        const discount = 1 - (parseInt(discounts[i]) / 100);
        const cost = rate * discount * quantities[i];
        purchases.push({
            p_id: productids[i],
            rate: rate,
            discount: discounts[i],
            cost: cost
        });
        totalPrice += rate * quantities;
        totalCost += cost;
    }
    const transaction = database.createTransaction(req.seller_id, req.buyer_id, totalCost, Date.now());
});


https
    .createServer(
        {
            key: fs.readFileSync("server.key"),
            cert: fs.readFileSync("server.cert"),
        },
        app
    )
    .listen(3000, function () {
            console.log(
            "Example app listening on port 3000! Go to https://localhost:3000/"
        );
    });