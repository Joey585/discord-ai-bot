const {Schema} = require('mongoose');
const mongoose = require("mongoose");
const userSchema = new Schema({
    username: String,
    uid: Number,
    id: String,
    messages: Number
});

module.exports = mongoose.model('User', userSchema);