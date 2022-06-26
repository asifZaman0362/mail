const app = require('express')();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const database = require('./database');
const auth = require('./auth');

app.use(cookieParser);
app.use(bodyParser.urlencoded({ extended: false }));



app.listen(8000, () => {
    console.log("Express server started at http://localhost:8000");
});