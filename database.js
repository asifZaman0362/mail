const mongoose = require('mongoose');
const uuid = require('uuid');

const userSchema = new mongoose.Schema({ 
    username: String, 
    domain: String,
    password: String, 
    first_name: String,
    last_name: String
});

const mailSchema = new mongoose.Schema({
    mail_id: String,
    subject: String,
    body: String,
    sender_id: String,
    attachment: String // this is the filepath to the attachment binary data
});

const models = {
    User: mongoose.model('User', userSchema),
    Email: mongoose.model('Mail', mailSchema),
};

async function createConnection() {
    return mongoose.connect('mongodb://192.168.1.5:27017');
}

async function get_user(username, domain) {
    return models.User.findOne({ username: username, domain: domain });
}

async function createUser(username, domain, password, firstname, lastname) {
    try {
        const user = new models.User({
            username: username,
            domain: domain,
            password: password,
            first_name: firstname,
            last_name: lastname
        });
        return user.save();
    } catch (error) {
        console.error('error saving user info: ', error);
        return null;
    }
}

async function createMail(id, subject, body, attachment, sender_id) {
    try {
        const mail = new models.Email({
            mail_id: id,
            subject: subject,
            body: body,
            sender_id: sender_id,
            attachment: attachment
        });
        return mail.save();
    } catch (error) {
        console.error('error saving mail: ', error);
        return null;
    }
}

async function get_mail() {
    try {
        return await models.Email.find();
    } catch (err) {
        console.error(err);
    }
}

async function get_mail_by_id(id) {
    try {
        return await models.Email.findOne({ mail_id: id });
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

async function drop_database() {
    try {
        models.Email.drop();
        models.User.drop();
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    models,
    createConnection,
    get_users,
    get_user,
    get_mail,
    get_mail_by_id,
    createUser,
    createMail,
    drop_database,
}