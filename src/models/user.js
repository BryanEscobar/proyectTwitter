'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = Schema({
    user: String,
    password: String,
    name: String,
    username: String,
    email: String,
    
    tweets: [{
        description:String
    }],


    followers: [{type:Schema.Types.ObjectId, ref:'user'}],
    following: [{type:String}],
    numberTweets: Number,
    numberFollow: Number,
    numberFollowing:Number

});

module.exports = mongoose.model('user',userSchema);