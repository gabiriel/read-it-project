/**
 * Created by Gabi on 23/06/2015.
 */
var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secretToken = '$eucrèt';

var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true},
    mail: {type: String, lowercase: true, unique: true},
    firstname: String,
    lastname: String,
    roles: {
            user: {type: Boolean, default: true},
            admin: {type: Boolean, default: false}
    },
    hashpass: String,
    salt: String,
    favoris:[String],
    reads:[{
        idOeuvre:String,
        idChapter:String
    }]
});

UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hashpass = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

    return this.hashpass === hash;
};

UserSchema.methods.generateJWT = function() {
    // set expiration to 30 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 30);

    return jwt.sign({
        _id: this._id,
        username: this.username,
        roles: this.roles,
        exp: parseInt(exp.getTime() / 1000),
    }, secretToken);
};

mongoose.model('User', UserSchema);