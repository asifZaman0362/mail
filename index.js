const express = require('express');
const session = require('express-session');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const { Server } = require('socket.io');
const axios = require('axios');
const cors = require('cors');

const database = require('./database');
const auth = require('./auth');
const crypto = require('./crypto');
const ws = require('ws');

require('dotenv').config();
const app = express();
database.createConnection();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: '6HBnWF56qv@nME'
}));

app.use(express.static('public'));

app.use(cors({
    origin: '*'
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

currentMailbox = [];

app.get('/', async (req, res) => {
    try {
        let token = '';
        if (req.cookies['jsonwebtoken'])
            token = req.cookies['jsonwebtoken'];
        console.log('token: ', token);
        const accessLevel = await auth.getAccessLevel(token);
        req.session.user = 'user';
        req.session.success = "Successfully logged in as <b>" + 'user' + "</b>!";
        if (!accessLevel) return res.status(401).redirect('/login');
        else return res.status(200).redirect('/inbox');
    } catch (error) {
        console.error(error);
        return res.status(401).redirect('/login');
    }
});

app.get('/login', (req, res) => {
    return res.status(200).render('login');
});

app.get('/register', async (req, res) => {
    const users = await database.get_users();
    if (users.length == 0) {
        return res.status(200).render('register');
    } else {
        console.log(users.length);
        return res.status(400).redirect('/login?code=409');
    }
})

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = await auth.getPasswordHash(req.body.password);
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const domain = req.body.domain;
    const users = await database.get_users();
    if (users.length > 0) {
        console.log('user already exists!');
        return res.status(409).redirect('/register?code=409');
    } else {
        if (await database.createUser(username, domain, password, firstname, lastname)) {
            console.log('user created sucessfully');
            return res.status(200).redirect('/login');
        }
        else return res.status(500).redirect('/register?code=500');
    }
});

app.post('/sendMail', async (req, res) => {
    //const mail = req.body;
    const mail = req.body;
    const dest = mail.target;
    const payload = crypto.encrypt(JSON.stringify(mail));
    apiSocket.send(JSON.stringify({
        SendMail: {
            next: dest,
            mail: JSON.stringify(payload)
        }
    }));
    return res.status(200).send('https://localhost:8080/inbox?code=1');
});

app.post('/add_contact', auth.is_logged_in, async (req, res) => {
    let name = req.body.name;
    let address = req.body.address;
    let email = req.body.email;
    let phone = req.body.phone;
    let result = await database.createContact(name, email, phone, address);
    if (result != null) {
        console.log('Added contact: ', result);
        return res.status(200).redirect('/admin');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('jsonwebtoken');
    req.session.destroy();
    return res.status(200).redirect('/login');
});

app.get('/getMail', auth.is_logged_in, async (req, res) => {
    let id = req.query.id;
    console.log(req.query);
    let mail = await database.get_mail_by_id(id);
    console.log(mail);
    res.status(200).send(mail);
});

app.get('/deleteMail', auth.is_logged_in, async (req, res) => {
    let id = req.query.id;
    await database.removeMail(id);
    res.status(200).send("success");
});

app.get('/star', auth.is_logged_in, async (req, res) => {
    console.log('starring ', req.query.id);
    let id = req.query.id;
    await database.toggle_star(id);
    res.status(200).send("success");
});

/*
    Search patterns:
    to: regex; from: regex; subject: regex; body: regex; date_start: date; date_end: date;

*/
app.get('/search', auth.is_logged_in, async (req, res) => {
    try {
        let searchPattern = req.query.searchPattern;
        let toRegex = /to:[a-zA-Z0-9@]*;?/;
        let fromRegex = /from:[a-zA-Z0-9@]*;?/;
        let subjectRegex = /subject:*;?/;
        let bodyRegex = /body:*;?/;
        let filter = currentMailbox.filter( mail => {
            let result = false;
            let to = toRegex.exec(searchPattern);
            if (to) {
                let dest = to[0].split(':')[1].split(';')[0];
                result |= mail.destination.match(dest) != null;
            }
            let from = fromRegex.exec(searchPattern);
            if (from) {
                let sender = from[0].split(':')[1].split(';')[0];
                result |= mail.sender_id.match(sender) != null;
            }
            let subject = subjectRegex.exec(searchPattern);
            if (subject) {
                let sub = subject[0].split(':')[1].split(';')[0];
                result |= mail.subject.match(sub) != null;
            }
            let body = bodyRegex.exec(searchPattern);
            if (body) {
                let bod = body[0].split(':')[1].split(';')[0];
                result |= mail.body.match(bod) != null;
            }
            return result;
        });
        console.log('found emails', filter);
        return res.status(200).render('main.pug', { emails: filter });
    } catch (error) {
        console.error(error);
        res.status(200).redirect('/inbox');
    }
});

app.get('/inbox', auth.is_logged_in, async (req, res) => {
    let mail = await axios.get("http://127.0.0.1:4000/messages?identifier=" + await database.getIdentifier() + '&password=' + await database.getIdKey());
    if (mail.data && mail.data.length > 0) {
        for (let email of mail.data) {
            try {
                let mail = JSON.parse(crypto.decrypt(email.payload));
                await database.createMail(mail.subject, mail.body, mail.sender, mail.destination);
            } catch (err) {
                console.error(err);
            }
        }
    }
    let emails = await database.get_inbox();
    if (emails == null) emails = [];
    currentMailbox = emails;
    return res.status(200).render('main.pug', {emails: emails})
});

app.get('/outbox', auth.is_logged_in, async (req, res) => {
    let emails = await database.get_outbox();
    if (emails == null) emails = [];
    currentMailbox = emails;
    return res.status(200).render('main.pug', {emails: emails})
});

app.get('/starred', auth.is_logged_in, async (req, res) => {
    let emails = await database.get_starred();
    if (emails == null) emails = [];
    currentMailbox = emails;
    return res.status(200).render('main.pug', {emails: emails})
});

app.get('/list_contact', auth.is_logged_in, async (req, res) => {
    let contacts = await database.get_contacts();
    return res.status(200).render('list_contacts.pug', {retailers: retailers, username: req.session.username, usertype: req.session.usertype});
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (await auth.verifyPassword(username, password)) {
        let token = await auth.generateToken(username);
        res.cookie('jsonwebtoken', token, { maxAge: 60*60*24*60, httpOnly: true });
        return res.status(200).redirect('/');
    } else {
        return res.status(401).redirect('/login?code=401');
    }
});

app.get('/compose', auth.is_logged_in, async (req, res) => {
    res.status(200).render('compose.pug', { user: { name: await database.getName(), email:  await database.getIdentifier() }});
});

app.get('*', (req, res) => {
    return res.status(404).render('404', { title: '404: Page not found!', username: req.session.username, usertype: req.session.usertype });
});

const apiSocket = new ws.WebSocket("ws://localhost:4000");

apiSocket.addEventListener("open", async (event) => {
    // we have to send an activation message
    apiSocket.send(JSON.stringify({
        ActivationMessage: [
            await database.getIdentifier(),
            await database.getIdKey()
        ]
    }));
});

apiSocket.addEventListener("message", async (event) => {
    console.log('server message: ', event.data);
    let data = JSON.parse(event.data);
    let message = JSON.parse(crypto.decrypt(data));
    console.log(message);
    await database.createMail(message.subject, message.body, message.sender, message.target, message.date);
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
