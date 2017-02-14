var jwt = require('jwt-simple');
var validateUser = require('../module/auth').validateUser;

module.exports = function(req, res, next) {

    // When performing a cross domain request, you will recieve
    // a preflighted request first. This is to check if our the app
    // is safe.

    // We skip the token outh for [OPTIONS] requests.
    //if(req.method == 'OPTIONS') next();

    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];
    var log_key = (req.body && req.body.log_key) || (req.query && req.query.log_key) || req.headers['log-key'];
    // req.username = key;
    if (log_key && (token || key)) {
        var decoded = jwt.decode(token, require('../config/secret.js')());
        if (decoded.exp <= Date.now()) {
            res.status(400);
            res.json({
                "status": 400,
                "message": "Token Expired"
            });
            return;
        } else {
            validateUser(key, log_key).then(function(dbUser) {
                if (dbUser) {
                    var haveAccess = (req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/') >= 0);
                    if (haveAccess) {
                        next(); // To move to next middleware
                    } else {
                        res.status(403);
                        res.json({
                            "status": 403,
                            "message": "Not Authorized"
                        });
                        return;
                    }
                } else {
                    // No user with this name exists, respond back with a 401
                    res.status(401);
                    res.json({
                        "status": 401,
                        "message": "Invalid User"
                    });
                    return;
                }
            }, function(error) {
                res.status(500);
                res.json({
                    "status": 500,
                    "message": "Oops something went wrong" + error,
                    "error": error
                });
                return;
            });
        }

    } else {
        res.status(401);
        res.json({
            "status": 401,
            "message": "Invalid Token or Key"
        });
        return;
    }
};
