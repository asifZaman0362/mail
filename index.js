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
    }
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