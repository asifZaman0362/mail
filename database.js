const mongoose = require('mongoose');
const uuid = require('uuid');

const userSchema = new mongoose.Schema({ 
    username: String, 
    domain: String,
    password: String, 
    first_name: String,
    last_name: String,
    id_key: String,
});

const mailSchema = new mongoose.Schema({
    mail_id: String,
    subject: String,
    body: String,
    sender_id: String,
    destination: String,
    date: String,
    star: Boolean
});

const models = {
    User: mongoose.model('User', userSchema),
    Email: mongoose.model('Mail', mailSchema),
};

async function createConnection() {
    return mongoose.connect('mongodb://localhost:27017');
}

async function get_user(username) {
    return models.User.findOne({ username: username });
}

async function createUser(username, domain, password, firstname, lastname) {
    try {
        const user = new models.User({
            username: username,
            domain: domain,
            password: password,
            first_name: firstname,
            last_name: lastname,
            id_key: uuid.v4()
        });
        return user.save();
    } catch (error) {
        console.error('error saving user info: ', error);
        return null;
    }
}

async function createMail(subject, body, sender_id, destination, date) {
    try {
        let id = uuid.v4();
        const mail = new models.Email({
            mail_id: id,
            subject: subject,
            body: body,
            sender_id: sender_id,
            destination: destination,
            date: date,
            star: false
        });
        return mail.save();
    } catch (error) {
        console.error('error saving mail: ', error);
        return null;
    }
}

async function getUsername() {
    try {
        const user = models.User.findOne();
        return user.username;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getIdentifier() {
    try {
        const user = await models.User.findOne();
        return user.username + '@' + user.domain;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getIdKey() {
    try {
        const user = await models.User.findOne();
        return user.id_key;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getName() {
    try {
        const user = await models.User.findOne();
        return user.first_name + ' ' + user.last_name;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function get_inbox() {
    try {
        return await models.Email.find({ destination: await getIdentifier() });
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function get_outbox() {
    try {
        return await models.Email.find({ sender_id: await getIdentifier() });
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function get_mail(own = false) {
    try {
        //if (own) return await models.Email.find({ sender_id: { $ne: await getIdentifier() }})
        if (!own) return await models.Email.find({ sender_id: await getIdentifier() });
    } catch (err) {
        console.error(err);
    }
}

async function get_drafts() {
    try {
        return await models.Email.find({ draft: true });
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function get_starred() {
    try {
        return await models.Email.find({ star: true });
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function toggle_star(id) {
    try {
        let found = await models.Email.findOne({mail_id: id});
        console.log(found);
        await models.Email.findOneAndUpdate({mail_id: id}, { star: !found.star });
        return true;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function get_trashed() {
    try {
        return await models.Email.find({ trashed: true });
    } catch (err) {
        console.error(err);
        return null;
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
        return null;
    }
}

async function removeMail(id) {
    try {
        return await models.Email.deleteOne({mail_id: id});
    } catch (err) {
        console.error(err);
        return null;
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
    get_starred,
    get_trashed,
    get_drafts,
    get_inbox,
    get_outbox,
    removeMail,
    getUsername,
    getIdentifier,
    getName,
    getIdKey,
    toggle_star
}