var jwt = require('jwt-simple');
const _ = require('lodash');
const users = require('../config/users');

var auth = {

        login: function(req, res) {
            // TODO: password secure!
            var username = req.body.username || '';
            var password = req.body.password || '';
            var log_key = req.body.logkey || '';

            if (username == '' || password == '') {
                invalidCreadentialResponse(res);
                return;
            }
            auth.validate(username, password, log_key).then(function(dbUserObj) {
                if (!dbUserObj) { // If authentication fails, we send a 401 back
                    invalidCreadentialResponse(res);
                    return;
                }
                if (dbUserObj) {
                    // If authentication is success, we will generate a token
                    // and dispatch it to the client
                    res.json(genToken(dbUserObj));
                }
            }, function(error) {
                invalidCreadentialResponse(res);
                return;
            });


        },

        validate: function(username, password, logkey) {
            // spoofing the DB response for simplicity
            // spoofing a userobject from the DB.
            return new Promise(function(resolve, reject) {

                if (logkey === '1') {

                    var dbUserObj = _.find(users, function(o) {
                        return (o.username === username && o.password === password);
                    });
                    if (dbUserObj) {
                        resolve(dbUserObj);
                    } else {
                        reject(Error('Error!'));
                    }
                } else {
                    reject(Error('Error!'));
                }
            });

        },
        validateUser: function(username, logKey) {
            // spoofing the DB response for simplicity
            return new Promise(function(resolve, reject) {
                // console.log("log_sample--" + dbUserObj);
                if (logKey === '1') {
                    var dbUserObj = {};
                    dbUserObj = _.find(users, function(o) {
                        return (o.username === username);
                    });
                    if (dbUserObj) {
                        resolve(dbUserObj);
                    } else {
                        reject(Error('Error!'));
                    }
                } else {
                    reject(Error('Error!'));
                }
            });
        }
    }
    // private method
function genToken(user) {
    var expires = expiresIn(7); // 7 days
    var token = jwt.encode({
        exp: expires
    }, require('../config/secret')());

    return {
        token: token,
        expires: expires,
        user: user
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
    // return dateObj.setMinutes(dateObj.getMinutes() + numDays);
}
var invalidCreadentialResponse = function(res) {
    res.status(401);
    res.json({
        "status": 401,
        "message": "Invalid credentials"
    });
}
module.exports = auth;
