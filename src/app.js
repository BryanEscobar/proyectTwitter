'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Variables Globales
var app= express();
var userRoutes = require("./routes/userRoutes")
var md_auth = require("./middlewares/authenticated")

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())

//Rutas
app.use('',userRoutes)

module.exports = app;