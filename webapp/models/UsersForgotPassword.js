/**
 * Created by Gabi on 24/06/2015.
 */
var mongoose = require('mongoose');
var crypto = require('crypto');

var UserForgotPasswordSchema = new mongoose.Schema({
    mail: String,
    resetPasswordToken: Object
});

mongoose.model('UserForgotPassword', UserForgotPasswordSchema);