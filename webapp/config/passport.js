/**
 * Created by Gabi on 22/06/2015.
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(username, password, done) {
        User.findOne({ mail: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: "L'utilisateur n'existe pas" });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: "Le mot de passe saisi est incorrect" });
            }
            return done(null, user);
        });
    }
));
