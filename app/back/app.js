// const http = require('http');
const express = require('express');
const app = express();
const fs = require("fs");
const bodyParser = require('body-parser');
const studentRouter = require('./routes/studentRoute');
const authentication = require('./routes/authentication');


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

app.all('/*', function(req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,Log-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you
// are sure that authentication is not needed
app.all('/api/*', [require('./middlewares/validateRequest')]);

app.use('/api/student', studentRouter);

app.use('/', authentication);

app.get('/test', function(req, res) {
    res.send('You are wellcome.')
});
app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
    // require('./config/document')(app._router.stack, 'express');
});
