'use strict'
const express = require('express');
var userController = require("../controller/userController");
const { ensureAuth } = require('../middlewares/authenticated');
 (ensureAuth)




var api = express.Router();
api.post('',ensureAuth,userController.commands);


module.exports = api;