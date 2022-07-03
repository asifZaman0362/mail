const express = require('express');
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

app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
    try {
        const token = req.cookies['jsonwebtoken'].split('=')[1];
        const accessLevel = auth.getAccessLevel(token);
        if (!accessLevel) return res.status(401).redirect('/login');
        else if (accessLevel == "admin") {
            return res.status(200).redirect('/admin');
        } else {
            return res.status(200).redirect('/editor');
        }
    } catch (error) {
        console.error('error: ', error);
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
    const password = auth.getPasswordHash(req.body.password);
    const phone = req.body.phone;
    const email = req.body.email;
    if (database.get_user(username, usertype)) {
        return res.status(409).redirect('/register?code=409');
    } else {
        if (database.createUser(username, usertype, password, email, phone))
            return res.status(200).redirect('/login');
        else return res.status(500).redirect('/register?code=500');
    }
});

app.get('/logout', (req, res) => {
    req.cookies['jsonwebtoken'] = null;
    return res.status(200).redirect('/login');
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const usertype = req.body.usertype;
    const password = req.body.password;
    if (auth.verifyPassword(username, usertype, password)) {
        res.cookie('jsonwebtoken', auth.generateToken(username, usertype), { maxAge: 60*60*24*60, httpOnly: true });
        return res.status(200).redirect('/');
    } else {
        return res.status(401).redirect('/login?code=401');
    }
});

app.post('/add_retailer', auth.checkAccess, async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    database.createRetailer(name, email, phone, address);
});

app.post('/add_distributor', auth.checkAccess, async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    database.createDistributor(name, email, phone, address);
});

app.post('/add_product', auth.checkAccess, async (req, res) => {
    const name = req.body.name;
    const id = req.body.id;
    const mfg_cost = req.body.manufacturing_cost;
    const mfr = req.body.manufacturer_name;
    const price = req.body.retail_price;
    const stock = req.body.stock;
    database.createProduct(name, id, mfg_cost, mfr, stock, price);
});

app.get('*', (req, res) => {
    return res.status(404).render('404', { title: '404: Page not found!' });
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