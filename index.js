const express = require('express');
const session = require('express-session');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const { Server } = require('socket.io');

const database = require('./database');
const auth = require('./auth');
const crypto = require('./crypto');
const ws = require('ws');

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

app.get('/logout', (req, res) => {
    res.clearCookie('jsonwebtoken');
    req.session.destroy();
    return res.status(200).redirect('/login');
});

app.get('/list_mail', auth.is_editor, async (req, res) => {
    let products = await database.get_products();
    return res.status(200).render('list_product.pug', {products: products, username: req.session.username, usertype: req.session.usertype});
});

app.get('/list_contact', auth.is_editor, async (req, res) => {
    let contacts = await database.get_contacts();
    return res.status(200).render('list_contacts.pug', {retailers: retailers, username: req.session.username, usertype: req.session.usertype});
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

app.post('/add_contact', auth.is_editor, async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    await database.createContact(name, email, phone, address);
    return res.status(200).redirect('/editor');
});

app.get('*', (req, res) => {
    return res.status(404).render('404', { title: '404: Page not found!', username: req.session.username, usertype: req.session.usertype });
});

const apiSocket = new ws.WebSocket("ws://localhost:4000");

apiSocket.addEventListener("open", (event) => {
    console.log("connection established");
    // we have to send an activation message
    apiSocket.send(JSON.stringify({
        ActivationMessage: [
            "zero@mail.com",
            "zeroman"
        ]
    }));
});

apiSocket.addEventListener("message", (event) => {
    console.log("message from relay: ", event.data);
});

apiSocket.addEventListener("error", (event) => {
    console.error("error: ", event);
});


const server = https.createServer({
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
    },
    app
);

const io = new Server(server);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('logout', () => {
        socket.key = null;
    });
    socket.on('disconnect', () => {
        socket.key = null;
    });
    socket.on('login', (password) => {
        socket.key = password;
    });
    socket.on('sendMail', (mail) => {
        const destination = mail.destination;
        apiSocket.send({
            SendMail: {
                next: destination,
                mail: crypto.encrypt(mail)
            }
        });
    });
});

server.listen(8080, function () {
        console.log(
        "Example app listening on port 3000! Go to https://localhost:8080/"
    );
});
