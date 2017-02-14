const express = require('express');
const auth = require('../module/auth');

var authRouter = express.Router();

authRouter.post('/login', auth.login);

module.exports = authRouter;
