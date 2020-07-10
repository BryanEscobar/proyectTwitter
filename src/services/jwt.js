'use strict'

//var mongoose = require("mongoose")
//var Schema = mongoose.Schema;
var jwt = require("jwt-simple")
var moment=require("moment")
var secret='twitter'


exports.createToken = function(user){
    var payload={

        sub: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        password:user.apellido,
       
        iat: moment().unix(),
        exp: moment().day(30,'days').unix()
    }
    return jwt.encode(payload,secret)
}