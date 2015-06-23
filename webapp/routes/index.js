/**
 * Created by Gabi on 23/06/2015.
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: '$eucrèt', userProperty: 'payload'});
var nodemailer = require('nodemailer');

var mongoose = require('mongoose');
console.log('[index.js] Load mongoose models');
var User = mongoose.model('User');

/** Mail config
 *************************************************/
var sender_email = {
    user: "social.readit",
    address: this.user + "@gmail.com",
    password: "ChuckN0rr1s"
};
var mailTransport = nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user: sender_email.user,
        pass: sender_email.password
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/** Users
 ********************************************************/
router.post('/register', function(req, res, next){
    var formUser = req.body;
    if(!formUser.username || !formUser.password || !formUser.email){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    var newUser = new User({
        username: formUser.username,
        mail: formUser.email,
        firstname: formUser.prenom,
        lastname: formUser.nom
    });

    console.log("Check if user doesn't already exists");
    User.find({$or:[{mail: newUser.mail},{username: newUser.username}]}, function (err, userFromDB) {
        if (err) { return res.status(400).json({message: err }); }
        if (userFromDB.length>0){
            console.log("User already exists !");
            return res.status(400).json({message: 'This user already exists' });
        }
    });
    console.log("New user !");
    newUser.setPassword(req.body.password);

    newUser.save(function (err) {
        if (err){ return res.status(400).json({message: 'Error when saving user (' + newUser.username + ') : ' + err}); }

        console.log("Prepare email message");

        var ExemplaireText = "Bonjour " +  newUser.firstname + "<br/>"
            + "Felicitation pour votre inscription, " + "<br/>"
            + "Voici vos coordonnées : " + "<br/>"
            + "Username: " + newUser.username + "<br/>"
            + "Pour plus d'informations, n'hésitez pas à nous contacter par email : "
            + sender_email.address;

        var mailOptions = {
            from: 'Suivi Manga ✔ <' + sender_email.address + '>',
            to: newUser.mail,
            subject: 'Read-it - Inscription',
            html: ExemplaireText
        };

        console.log("Sending email");
        mailTransport.sendMail(mailOptions, function(err, response){
            var msg = " User (" + newUser.username + ") has been registered";
            if(err){
                console.log('[ERROR] ' + err);
                return res.status(400).json({message: msg + ' but an error has occured when sending email to '+ newUser.mail});
            }
            mailTransport.close();
            console.log("[SUCCESS] Email has been sent to <" + newUser.mail + ">");
        });
    });
    return res.json({token: newUser.generateJWT()});
});

router.post('/login', function(req, res, next){
    if(!req.body.email || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
        if(user){
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

module.exports = router;
