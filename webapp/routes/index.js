/**
 * Created by Gabi on 23/06/2015.
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: '$eucrèt', userProperty: 'payload'});
var nodemailer = require('nodemailer');
var crypto = require('crypto');


var mongoose = require('mongoose');
console.log('[index.js] Load mongoose models');
var User = mongoose.model('User');
var UserForgotPwd = mongoose.model('UserForgotPassword');
var CalendarEvent = mongoose.model('CalendarEvent');
var OeuvreModel = mongoose.model('Oeuvre');

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

router.post('/forgotpassword', function(req,res) {
    var formUser = req.body;

    User.find({mail: formUser.mail}, function (err,data) {
        if(err){ return res.send('erreur de db - users'); }
        if(data.length < 1){ return res.send("Cet utilisateur n'existe pas" ); }

        UserForgotPwd.find({mail: formUser.mail}, function(err,data){
            if(err){ return res.send('Erreur de db - forgot'); }
            if(data.length > 0) { return res.send('Vous avez déja demandé une récupération du mot de passe'); }
            var tokenCree = crypto.randomBytes(10).toString('hex');
            console.log(tokenCree);
            var tokenToSave = new UserForgotPwd({
                mail: formUser.mail,
                resetPasswordToken: tokenCree
            });
            tokenToSave.save(function (err) {
                if(err){ return res.send("erreur au sauvegarder token :"+err); }

                var ExemplaireText = "Pour changer votre mot de passe, il faut cliquer "
                    + "<a href=http://" + req.headers.host + "/#/user/reset/?token=" + tokenCree
                    + ">Ici</a></br>"
                    + "<b> Attention, ce lien ne fonctionne qu'une seule fois.</b>";

                var mailOptions = {
                    from: 'Suivi Manga ✔ <' + sender_email.address + '>',
                    to: formUser.mail,
                    subject: 'Récuperation du mot de passe',
                    html: ExemplaireText
                };

                mailTransport.sendMail(mailOptions, function (error, response) {
                    if (error) { return res.status(500).send("Erreur lors de l'envoie du mail : " + error); }
                        mailTransport.close();
                });
                return res.status(200).send('Vous venez de recevoir un mail afin de réinitialiser votre mot de passe');
            });
        });
    });
});

router.post('/user/reset/', function(req,res) {
    var params = req.body;
    UserForgotPwd.findOneAndRemove({resetPasswordToken: params.token}, function(err, data){
        if(err){ return res.send("erreur db"); }
        if(!data){ return res.send("Ce lien ne fonctionne plus."); }

        var currentUser = new User();
        User.find({mail: data.email}, function (err, user){
            if(err){ return res.send('Erreur user database'); }
            currentUser = user;
        });
        currentUser.setPassword(params.password);
        User.update({mail: currentUser.mail},{salt: currentUser.salt, hashpass: currentUser.hashpass}, function(err, id, res){
            if(err){ return res.send('Erreur user database'); }
        });
        return res.status(200).send("Password reset");
    });
});
/**
 * Create event from home.html (form near calendar)
 */
router.post('/event/create', auth, function(req, res, next) {
    var event = new CalendarEvent(req.body);
    event.author = req.payload.username;
    event.save(function(err, event){
        if(err){ return next(err); }
        console.log("[Mongoose] event successfuly created");
        res.json(event);
    });
});

router.post('/event/update', function(req, res, next) {

    var updatedEvent = req.body,
        query = {_id: updatedEvent._id},
        options = { multi: true };

    console.log("[Query] update event (id = " + updatedEvent._id + ")");

    CalendarEvent.update(query, {$set: updatedEvent}, options, function(err, event){
        if(err){ return next(err); }
        console.log("[Mongoose] event successfuly updated");
        res.json(event);
    });
});

router.post('/event/delete', function(req, res, next) {

    var updatedEvent = req.body,
        query = {_id: updatedEvent._id};

    console.log("[Query] remove event (id = " + updatedEvent._id + ")");

    CalendarEvent.remove(query, function(err, event){
        if(err){ return next(err); }
        console.log("[Mongoose] event successfuly removed");
        res.json(event);
    });
});

router.get('/events', function(req, res, next) {
    CalendarEvent.find(function(err, events){
        if(err){ return next(err); }
        console.log("[Mongoose] all events successfuly retrieved");
        res.json(events);
    });
});

router.get('/events/new', function(req, res, next) {
    CalendarEvent.find({display: false}, function(err, events){
        if(err){ return next(err); }
        console.log("[Mongoose] new events successfuly retrieved");
        res.json(events);
    });
});

/**
 *  Oeuvre
 */
router.get('/oeuvres', function(req,res){
    OeuvreModel.find(null, function (err, oeuvres) {
        if (err) { throw err; }
        console.log("[Mongoose] all oeuvres successfuly retrieved");
        res.json(oeuvres);
    });

});
router.get('/oeuvre', function(req,res){
    console.log("[Query] retrieve Oeuvre : (id" + req.query.id_Oeuvre +")");
    OeuvreModel.find({ '_id': req.query.id_Oeuvre }, function (err, oeuvre) {
        if (err) { throw err;}
        console.log("[Mongoose] oeuvre has been successfuly retrieved");
        res.json(oeuvre);
    });
});

module.exports = router;