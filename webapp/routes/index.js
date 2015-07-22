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
var fs = require("fs");


var mongoose = require('mongoose');
console.log('[index.js] Load mongoose models');
var User = mongoose.model('User');
var UserForgotPwd = mongoose.model('UserForgotPassword');
var CalendarEvent = mongoose.model('CalendarEvent');
var OeuvreModel = mongoose.model('Oeuvre');
var Commentaires = mongoose.model('Commentaires');
var Sondages = mongoose.model('Sondages');

/** Mail config
 *************************************************/
var sender_email = {
    user: "social.readit",
    address: "social.readit@gmail.com",
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
        return res.status(400).json({message: 'Veuillez remplir tout les champs nécessaire'}).end();
    }
    var newUser = new User({
        username: formUser.username,
        mail: formUser.email,
        firstname: formUser.prenom,
        lastname: formUser.nom,
        roles: {
            user: true,
            admin: false
        }
    });
    if(formUser.roles != undefined )
    {
        newUser.roles.admin = formUser.roles.admin;
    }

    console.log("Check if user doesn't already exists");

    User.find({$or:[{mail: newUser.mail},{username: newUser.username}]}, function (err, userFromDB) {
        if (err) { return res.status(400).json({message: err }).end(); }
        if (userFromDB.length>0){
            console.log("User already exists !");
            return res.status(400).json({message: 'Cet utilisateur existe déja (email ou username)' }).end();
        }

        console.log("New user !");
        newUser.setPassword(formUser.password);

        newUser.save(function (err) {
            if (err){
                return res.status(400).json({message: "Erreur lors de la sauvegarde de (" + newUser.username + ") : " + err}).end();
            }

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
                var msg = "L'utilisateur (" + newUser.username + ") à bien été créé";
                if(err){
                    console.log('[ERROR] ' + err);
                    return res.status(400).json({message: msg + ", mais une erreur s'est produite lors de l'envoi du mail à "+ newUser.mail});
                }
                mailTransport.close();
                console.log("[SUCCESS] Email has been sent to <" + newUser.mail + ">");
            });

            return res.json({message: "Le compte a bien été créé"}).end();
        });
    });
});

router.post('/login', function(req, res, next){
    if(!req.body.email || !req.body.password){
        return res.status(400).json({message: 'Veuillez renseigner tout les champs'}).end();
    }

    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
        if(user){
            return res.json({token: user.generateJWT()}).end();
        } else {
            return res.status(401).json(info).end();
        }
    })(req, res, next);
});
router.post('/forgotpassword', function(req,res) {
    var formUser = req.body;

    User.find({mail: formUser.mail}, function (err,data) {
        if(err){ return res.status(400).json({message: 'Erreur de DB - users'}).end(); }
        if(data.length < 1){ return res.status(400).json({message: 'Cet utilisateur n\'existe pas'}).end(); }

        UserForgotPwd.findOneAndRemove({mail: formUser.mail}, function(err,data){
            if(err){ return res.status(400).json({message: 'Erreur de DB - forgot'}).end(); }
            //if(data.length > 0) { return res.status(400).json({message: 'Vous avez déja demandé une récupération du mot de passe'}).end(); }
            var tokenCree = crypto.randomBytes(10).toString('hex');
            console.log(tokenCree);
            var tokenToSave = new UserForgotPwd({
                mail: formUser.mail,
                resetPasswordToken: tokenCree
            });
            tokenToSave.save(function (err) {
                if(err){ return res.status(400).json({message: 'Erreur pendant la création du token :'+err}).end();}

                var ExemplaireText = "Pour changer votre mot de passe, vous devez cliquer "
                    + "<a href=http://" + req.headers.host + "/#/user/reset/?token=" + tokenCree
                    + ">Ici</a></br>"
                    + "<b>" + "Attention, ce lien ne fonctionne qu'une seule fois." + "</b>";

                var mailOptions = {
                    from: 'Read-it ✔ <' + sender_email.address + '>',
                    to: formUser.mail,
                    subject: 'Récuperation du mot de passe',
                    html: ExemplaireText
                };

                mailTransport.sendMail(mailOptions, function (error, response) {
                    if (error) { return res.status(400).json({message: "Erreur lors de l'envoie du mail : " + error}).end(); }
                        mailTransport.close();
                });
                return res.status(200).send('Vous venez de recevoir un mail afin de réinitialiser votre mot de passe').end();
            });
        });
    });
});
router.post('/user/reset/', function(req,res) {
    var params = req.body;
    UserForgotPwd.findOneAndRemove({resetPasswordToken: params.token}, function(err, data){
        if(err){ return res.status(400).json({message: "Erreur de DB"}).end(); }
        if(!data){ return res.status(400).json({message: "Ce lien ne fonctionne plus."}).end(); }

        var currentUser = new User();

        currentUser.setPassword(params.password);
        var query={mail: data.mail};
        var update={salt: currentUser.salt, hashpass: currentUser.hashpass};
        User.findOneAndUpdate(query, update, function (err, user) {
            if(err) return res.status(400).json({message: "Erreur pendant la mise a jour de l'utilisateur (" + formUser._id + ") : " + err}).end();

            console.log("Update success");
            return res.status(200).end();
        });

    });
});
router.post('/contact', function (req, res){
    var form = req.body;

    if( !(form.mail || form.subject || form.text) )
    {
        return res.status(400).send("Veuillez renseigner tout les champs").end();
    }

    var ExemplaireText = "Une requete venant du site web read-it" + "<br/>"
        + "Sujet : "+ form.subject + "<br/>"
        + "Corps du message : " + "<br/>" + form.text
        + "De : " + form.mail;

    var mailOptions = {
        from: 'Suivi Manga Form - <' + sender_email.address + '>',
        to: sender_email.address,
        subject: 'Formulaire de contact ReadIt : ' + form.mail,
        html: ExemplaireText
    };

    mailTransport.sendMail(mailOptions, function (error, response) {
        if (error) { return res.status(500).send("Erreur lors de l'envoi du mail : " + error).end(); }
        mailTransport.close();
    });
    return res.status(200).send('Votre mail à bien été envoyé').end();
});

/**
 * Event (calendar)
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
        updates = {$set: updatedEvent},
        options = { multi: true };

    console.log("[Query] update event (id = " + updatedEvent._id + ")");

    CalendarEvent.update(query, updates, options, function(err, event){
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
router.get('/events/displayed', function(req, res, next) {
    CalendarEvent.find({display: true}, function(err, events){
        if(err){ return next(err); }
        console.log("[Mongoose] Displayed events successfuly retrieved");
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
    OeuvreModel.findOneAndUpdate(
        { '_id': req.query.id_Oeuvre },
        { $inc: { accessCount: 1 } },
        { safe: true },
        function (err, oeuvre) {
            if (err) { return res.status(424).end();}
            console.log("[Mongoose] oeuvre has been successfuly retrieved");
            res.json(oeuvre);
        }
    );
});
router.post('/commentaire', function(req,res) {
    var commentaire = new Commentaires({
     user : req.body.user,
     id_oeuvre : req.body.id,
     commentaire :req.body.commentaire,
     date: new Date()
     });
    commentaire.save(function (err) {
        if (err) { return res.status(400).end(err); }
        return res.end("success");
    });

});

router.get('/comments', function(req,res) {
    var query = Commentaires.find(null);
    query.where("id_oeuvre", req.query.id_Oeuvre);
    query.exec(function (err, comms) {
        if (err) { return res.status(424).end();}
        res.json(comms);
    });


});
router.post('/user/favorites/add',function(req,res) {
    var idOeuvre = req.body.idOeuvre;
    var idUser = req.body.idUser;

    console.log("[Query] Add oeuvre (" + idOeuvre + ") to favorites of user (" + idUser + ")");

    var query = { _id: idUser};
    var update = { $push: {favoris: idOeuvre} };
    var option = { safe: true};
    User.findOneAndUpdate(query, update, option, function(err, model) {
            if (err) {
                console.log("[Mongoose] - " + err);
                return res.end('error');
            }
            res.end('success');
        }
    );
});
router.post('/user/favorites/remove',function(req,res) {
    var idOeuvre = req.body.idOeuvre;
    var idUser = req.body.idUser;

    console.log("[Query] Remove oeuvre (" + idOeuvre + ") from favorites of user (" + idUser + ")");

    var query = { _id: idUser};
    var update = { $pull: {favoris: idOeuvre} };
    var option = { safe: true };
    User.findOneAndUpdate(query, update, option, function(err, model) {
            if (err) {
                console.log("[Mongoose] - " + err);
                return res.end('error');
            }
            return res.end('success');
        }
    );
});

router.get('/user/favorites/is',function(req,res) {
    var idOeuvre = req.query.idOeuvre;
    var idUser = req.query.idUser;

    console.log("[Query] Is this oeuvre (" + idOeuvre + ") is in favorites of user (" + idUser + ")");

    var query = { _id : idUser, favoris: idOeuvre };
    User.find(query)
        .count(function(err,count) {
            if(err) {
                console.log("[Mongoose] - " + err);
                return res.end('false');

            }
            console.log('[Mongoose] Favorite founded(' + count + ')');
            return res.end(String(count !== 0));
        });
});

router.get('/oeuvres/popular', function(req,res) {
    OeuvreModel
        .find()
        .sort({accessCount: -1})
        .limit(5)
        .exec(function(err, populaires) {
            if(err) {
                console.log(err);
                return res.json({failure:true}).end();
            }
            return res.json(populaires).end();
        });
});
router.post('/oeuvre/rate', function(req,res) {
    var rating = req.body.rating;
    var idOeuvre = req.body.idOeuvre;
    var user = req.body.user;
    OeuvreModel.findOneAndUpdate(
        {
            _id: idOeuvre
        },
        {
            $pull: {
                'ratings': {
                    user: user
                }
            }
        },
        function(err, d) {
            if(err) return res.status(424).end();
            OeuvreModel.findOneAndUpdate(
                {
                    _id: idOeuvre
                },
                {
                    $push: {
                        'ratings': {
                            user: user,
                            rating: rating
                        }
                    }
                },
                {
                    safe : true,
                    'new': true
                },
                function(err,data) {
                    if(err) return res.status(424).end();
                    return res.json({rating: data.ratings.reduce(function(x,y) { return x + y.rating; }, 0) /data.ratings.length});
                });
        }
    );
});
//il vaut mieux utiliser oeuvre lorsqu'on charge l'oeuvre, mais on peut laisser cette données la
router.post('/oeuvre/rating', function(req,res) {
    var rating = req.body.rating;
    var idOeuvre = req.body.idOeuvre;

    OeuvreModel
        .findOne({
            _id: idOeuvre
        })
        .select({
            'ratings.rating':1
        })
        .exec(function(err,data) {
            if(err) {
                console.log(err);
                res.json({failure:true});
                return;
            }
            console.log(data);
            return res.json({ rating: data.reduce(function(x,y) { return x + y; }) /data.length || 0});
        });
});
router.get('/oeuvre/well_rated',function(req,res) {
    OeuvreModel
        .find()
        .exec(function(err,data) {
            //data contains all oeuvre
            if(err) {
                console.log(err);
                return res.json({failure:true}).end();
            }
            res.json(
                data
                    .map(function(oeuvre) {
                        return {
                            _id:oeuvre._id,
                            name: oeuvre.name,
                            rating:
                                oeuvre.ratings
                                    ? oeuvre.ratings.reduce(function(x,y) { return x + y.rating; }, 0) / oeuvre.ratings.length || 0 : 0
                        }
                    })
                    .sort(function(e1,e2) {
                        return e2.rating - e1.rating;
                    })
                    .splice(0,5)
            );
        })
});
router.post('/oeuvre/read',function(req,res) {
    var idOeuvre = req.body.idOeuvre;
    var user = req.body.user;
    var idChapter = req.body.idChapter;
    console.log(user + ' has read ' + idChapter + ' from ' + idOeuvre);
    User.findOneAndUpdate(
        {
            username:user
        },
        {
            $addToSet: {
                'reads': {
                    idOeuvre: idOeuvre,
                    idChapter: idChapter
                }
            }
        },
        {
            safe: true
        },
        function(err,data) {
            if(err) {
                console.log('error during read saving : ' + read);
                return res.end("failure");
            }
            return res.end('success');
        }
    );
});

router.post('/oeuvre/read',function(req,res) {
    var user = req.body.user;
    var idChapter = req.body.idChapter;
    console.log(user + ' has read ' + idChapter + ' from ' + idOeuvre);
    OeuvreModel
        .find({})
        .exec(function(data) {
            User.findOneAndUpdate(
                {
                    username:user
                },
                {
                    $addToSet: {
                        'reads': {
                            idOeuvre: idOeuvre,
                            idChapter: idChapter
                        }
                    }
                },
                {
                    safe: true
                },
                function(err,data) {
                    if(err) {
                        console.log('error during read saving : ' + read);
                        return res.end("failure");
                    }
                    res.end('success');
                }
            );
        });
});

router.post('/oeuvre/unread',function(req,res) {
    var idOeuvre = req.body.idOeuvre;
    var user = req.body.user;
    var idChapter = req.body.idChapter;
    console.log(user + ' has not read ' + idChapter + ' from ' + idOeuvre);
    User.findOneAndUpdate(
        {
            username:user
        },
        {
            $pull: {
                'reads': {
                    idOeuvre: idOeuvre,
                    idChapter: idChapter
                }
            }
        },
        {
            safe: true
        },
        function(err,data) {
            if(err) {
                console.log('error during unread saving : ' + read);
                res.end("failure");
                return;
            }
            res.end('success');
        }
    );
});
router.get('/oeuvre/get/read',function(req,res) {
    var idOeuvre = req.query.idOeuvre;
    var user = req.query.user;
    User
        .findOne({username:user})
        .select('reads')
        .exec(function(err,data) {
            if(err) {
                console.log('error : ' + err);
                return;
            }
            if(data == null) {
                console.log("no such user : " + user);
                return;
            }
            res.json(
                data.reads
                    .filter(function(elem) {
                        return elem.idOeuvre == idOeuvre;
                    })
                    .map(function(elem) {
                        return elem.idChapter;
                    })
            );
        })
});

router.get('/User',function(req,res){
    var currentUser = req.query.currentUser;
    User.findOne({username: currentUser},function (err, user) {
        if(err){ console.log(err); return; }
        if(user != null) {
            // remove secret content for better security
            user.hashpass = "";
            user.salt = "";
        }
        res.json(user);
    });
});

router.get('/Users',function(req,res) {
    var query = {username: { $ne:req.query.currentUser}};
    User.find(query, function (err, users){
            res.json(users);
        }
    );
});

router.get('/users/search',function(req,res) {
    var searched = req.query.searched;
    User.find({username: {$regex: searched, $options: "i" }})
        .exec(function(err, data) {
            if(err) {
                console.log('error : ' + err);
                return res.end("error");
            }
            console.log('data ' + data);
            return res.json(data).end();
        });
});
router.get('/usersDelete',function(req,res){
    User.remove({username: req.query.deleteUser},function(err,users){
        res.json(users);
    })
});
router.post("/modifyUser" ,function (req,res){
    var formUser = req.body;

    if( !(formUser.firstname || formUser.lastname || formUser.mail) ){
        return res.status(400).json({message: 'Veuillez renseigner tout les champs'});
    }

    var query = {_id: formUser._id};
    var updates = {
        username: formUser.username,
        firstname: formUser.firstname,
        lastname: formUser.lastname,
        mail: formUser.mail,
        roles:{ user: formUser.roles.user, admin: formUser.roles.admin}
    };

    User.findOneAndUpdate(query, updates, function (err, user) {
        if(err) return res.status(400).json({message: "Erreur pendant la mise a jour de l'utilisateur (" + formUser._id + ") : " + err}).end();

        console.log("Update success");
        return res.status(200).send("L'utilisateur a été modifié").end();
    });
});

router.post('/messages',function(req,res) {
    console.log(req.body);
    var usernameSender = req.body.usernameSender;
    var usernameReciver = req.body.Username;
    var objet = req.body.Objet;
    var message = req.body.Message;
    User.findOneAndUpdate({username:usernameReciver},{
        $addToSet:{
              messages  :
                {
                    sender : usernameSender,
                    objet : objet,
                    message : message,
                    date : new Date()

                }
            }
        },
        {
            safe: true
        }

        ,function(err,user){
            if(user!=null)
                res.end("success");
            else
                res.end('echec');
    });
});


router.get('/messagesSend',function(req,res) {
    User.findOne({username:req.query.username},function(err,user){

        res.json(user.messages);

    });
});
router.get('/messagesUnread',function(req,res) {
    User.findOne({username:req.query.username},function(err,user){
        if(user == null)
            return res.end();

        res.json(user.messages
            .filter(function(elem) {
                return ! elem.reads;
            })
            .length);

    });
});
router.post('/messageRead',function(req,res){

    var id = req.body.id_message;
    User.update({username: req.body.reciver , 'messages._id': id },{$set: {'messages.$.reads' :true}},function(err,user){
        console.log(user);
        if(err) return res.status(424).end();
        res.end('success');
    })

});
router.post('/message/remove',function(req,res) {
    User.update(
        {
            username: req.body.username
        },
        {
            $pull:
            {
                'messages':
                 {
                     _id: req.body.id_message
                 }
            }
        },
        function(err,user) {
            if(err) return res.status(424).end();
            res.end('sucess');
        });

});
router.get('/DetailUser',function(req,res) {
    User.find({username:
        {
            $ne:req.query.currentUser
        }
        }
        ,function (err, user)
        {
            res.json(user);
        }
    );
});
router.post('/oeuvre/create',function(req,res) {
    var oeuvre = JSON.parse(req.body.oeuvre);
    var save = function(err, data) {
        var i;
        for(var i in oeuvre.chapters) {
            if(req.files['image-' + i]) {
                fs.rename(req.files['image-' + i].path, 'app/img/Covers/' + req.files['image-' + i].name, function(err, data) {
                    if(err) return res.status(424).end();
                });
                oeuvre.chapters[i].cover = req.files['image-' + i].name;
            }
        }
        OeuvreModel.create(oeuvre,function(err, data){
            if(err) {
                res.end('error');
                return;
            }
            res.end('success');
        });
    };
    if(req.files['image']) {
        oeuvre.cover = req.files['image'].name;
        fs.rename(req.files['image'].path, 'app/img/Covers/' + req.files['image'].name, save);
    }else {
        save('','');
    }
});
router.post('/oeuvre/rate/chapter',function(req,res) {

   OeuvreModel.findOneAndUpdate(
        {
            _id:req.body.oeuvreId,
            'chapters._id':req.body.chapterId
        },
        {
           $pull: {
                'chapters.$.ratings':{
                   user: req.body.user
                }
            }
        },
        function(err, data) {
           if(err) {
               return res.status(424).end();
           }
           OeuvreModel.findOneAndUpdate(
               {
                   _id: req.body.oeuvreId,
                   'chapters._id': req.body.chapterId
               },
               {
                   $addToSet: {
                       'chapters.$.ratings':{
                           user: req.body.user,
                           rating: req.body.rating
                       }
                   }
               },
               {
                   safe: true,
                   'new':true
               },
               function(err,data) {
                   if(err) {
                       return res.status(424).end();
                   }
                   console.log(data.chapters.constructor);
                   var ratings;
                   for (var i in data.chapters) {
                       if(data.chapters[i]._id == req.body.chapterId) {
                           ratings = data.chapters[i].ratings;
                           break;
                       }
                   }
                   res.json(
                       ratings
                           .reduce(function(cur,next) {
                               return cur + next.rating;
                           }, 0)/ratings.length
                   );
               }
           );
        }
   )
});

router.post('/oeuvre/read/all',function(req,res) {
    var idOeuvre = req.body.idOeuvre;
    var userId = req.body.user;
    OeuvreModel
        .findOne({_id: idOeuvre})
        .select('chapters')
        .exec(function(err,data) {
            if(err) return res.status(424).end();
            console.log(data.chapters.map(function(elem) {
                return {
                    idOeuvre: idOeuvre,
                    idChapter: elem._id
                }
            }));
            User.findOneAndUpdate(
                {
                    _id:userId
                },
                {
                    $addToSet:
                    {
                        reads:
                        {
                            $each: data.chapters.map(function(elem) {
                                return {
                                    idOeuvre: idOeuvre,
                                    idChapter: elem._id
                                }
                            })
                        }
                    }
                },
                {
                    safe: true
                },
                function(err,data) {
                    if(err) {
                        console.log('error during read saving : ' + err);
                        res.end("failure");
                        return;
                    }
                    res.end('success');
                }
            );
        });
});
router.post('/oeuvre/update',function(req,res) {
    var oeuvre = JSON.parse(req.body.oeuvre);
//    console.log('oeuvre',JSON.stringify(req.body.oeuvre));
    var oeuvreId = oeuvre._id;
    var authors = oeuvre.author;
    var categories = oeuvre.category;
    var name = oeuvre.name;
    var newChapters = oeuvre.newChapters;
    var removedChapter = oeuvre.removedChapters;
    var links = oeuvre.links;
    var update = function(err, data) {
        for(var i in newChapters) {
            if(req.files['image-' + i]) {
                fs.rename(req.files['image-' + i].path, 'app/img/Covers/' + req.files['image-' + i].name, function(err, data) {
                    if(err) return res.status(424).end();
                });
                newChapters[i].cover = req.files['image-' + i].name;
            }
        }
        var updateQuery = {
            $set: {
                category: categories,
                author: authors,
                name: name,
                links: links
            },
            $pull: {
                chapters: {
                    _id: {
                        $in: removedChapter.map(
                            function (e) {
                                return e._id
                            }
                        )
                    }
                }
            }
        };
        if(req.files['image'])
            updateQuery.$set.cover = req.files['image'].name;
        OeuvreModel.findOneAndUpdate(
            {
                _id: oeuvreId
            },
            updateQuery,
            function (err, data) {
                if (err) {
                    return res.status(424).end();
                }
                OeuvreModel
                    .findOneAndUpdate(
                    {
                        _id: oeuvreId
                    },
                    {
                        $push: {
                            chapters: {
                                $each: newChapters
                            }
                        }
                    },
                    {
                        safe: true
                    },
                    function (err, data) {
                        if (err) {
                            return res.status(424).end();
                        }
                        res.end();
                    }
                );
            }
        );
    };
    if(req.files['image']) {
        fs.rename(req.files['image'].path, 'app/img/Covers/' + req.files['image'].name, update);
    }else {
        update('','');
    }
});
router.post('/oeuvre/remove',function(req,res) {
    var oeuvreId = req.body.idOeuvre;
    OeuvreModel
        .find({_id: oeuvreId})
        .remove()
        .exec(function(err,data) {
            if(err) return res.status(424).end();
            User
                .find()
                .update({
                    $pull: {
                        reads: {idOeuvre: oeuvreId}
                    }
                })
                .exec(function(err,data) {
                    if(err) return res.status(424).end();
                    return res.end('ok');
                })
        });
});

router.post('/sondage/create', function (req,res) {
    var questionForm = req.body;
    Sondages.find({}, function (err,data) {
        if(err)return res.status(400).json({message: 'Erreur lors de la chargement de données de la BD : ' + err}).end();
        else if(data.length==0){
            console.log("New Sondage !");
            var newSondage = new Sondages({
                questions:questionForm
            });
            newSondage.save(function (err,sondages) {
                if (err) {
                    return res.status(400).json({message: 'Erreur lors de la sauvegarde du sondage : ' + err}).end();
                } else{
                    var query = {_id: sondages._id};
                    var updates = {
                        IdActive:sondages.questions[0]._id
                    };
                    Sondages.findOneAndUpdate(query, updates, function (err, data) {
                        if (err){
                            return res.status(400).json({message: 'Error when insert question active (' + sondages._id + ') : ' + err}).end();
                        }
                        return res.status(200).json(data).end();
                    })
                }

            });

        }
        else{
            var query = { _id: data[0]._id};
            var update = { $push: {questions: questionForm} };
            Sondages.findOneAndUpdate(query, update, function(err, model) {
                    if (err) res.status(400).json({message: 'Erreur lors de l\'ajouter le question de la BD : ' + err}).end();
                    return res.status(200).json(data).end();
                }
            );

        }
    });
});
router.get('/Sondages',function(req,res) {
    Sondages.find({},function (err, sondages){
            res.json(sondages[0]);
        }
    );
});
router.post('/sondage/delete',function(req,res){
    console.log("Delete sondage");
    console.log(req.body._id);
    console.log();
    Sondages.update(
        {
            _id: req.body._id
        },
        {
            $pull:
            {
                'questions':
                {
                    _id: req.body._idquestion
                }
            }
        },
        function(err,sondage) {
            if (err) return res.status(400).json({message: 'Error where removing question'}).end();
            console.log(sondage[0]);
            res.json(sondage[0]);
            });
   /* Sondages.findOneAndRemove({_id: req.body._id},function(err,sondages){
        if (err) {
            console.log(err);
            return res.status(400).json({message: 'Error where removing user'}).end();
        }

        res.json(sondages);
    });*/
});
router.post('/sondage/modify',function(req,res){
    var form = req.body;
    var query = {'questions._id': form._idQuestion};

    Sondages.update(query,
            {'$set':
                {   'questions.$.question': form.question ,
                    'questions.$.reponses': form.reponses,
                    'questions.$.users': form.users
                }
            }, function (err, data) {
        if (err){
            return res.status(400).json({message: 'Error when updating sondage (' + detail._id + ') : ' + err}).end();
        }
        console.log("Update success");
        return res.status(200).end();
    })
});

router.post("/sondage/active", function (req,res) {
    var data = req.body;
    var query = {_id:data._id};
    var update = {IdActive:data._idQ};
    Sondages.findOneAndUpdate(query,update,function(err,data) {
            if(err) return res.status(400).json({message: 'Error when Active Question of sondage (' + data._id + ') : ' + err}).end();
            return res.json(data).end();
        })
});

router.post("/sondage", function (req,res) {
    var id = req.body._id;
    var query = {_id: id };
    Sondages.findOne(query, function (err, user) {
        if (err){
            return res.status(400).json({message: 'Error when display sondage (' + id + ') : ' + err}).end();
        }
        return res.json(user).end();
    });
});

router.get('/friends',function(req,res){
    User.findOne({'username': req.query.username},function(err, user){
        res.json(user.friends.filter(function(elem) {
            return elem.accepted;
        }));
    })
});
router.get('/user/friends',function(req,res) {
    User.find({'username': new RegExp(req.query.username, "i")},function(err, user) {
        res.json(user);

    });
});
router.post('/user/friends/add',function(req,res) {
    var i=0;
    User.findOneAndUpdate({username:req.body.userToAdd},{
            $addToSet:{
                friends  :
                {
                    name : req.body.user,
                    accepted : true,
                    date : new Date()
                }
            }
        },
        {
            safe: true
        }

        ,function(err,user){

            if(user!=null)
                i++;
        });
    User.findOneAndUpdate({username:req.body.user, 'friends.name':req.body.userToAdd},
        {
            $set:
            {
                'friends.$.accepted' :true,
                 'friends.$.date' : new Date()

            }
        },
        {
            safe: true
        }

        ,function(err,user){
            console.log("firens",user);
            if(user!=null)
                i++;
            if(i==2)
                return res.end("success");
            else
                return res.end("echec");
        });
});
router.post('/user/friends/requestAdd',function(req,res){
    User.findOneAndUpdate({username:req.body.friendsUsername},{
            $addToSet:{
                friends  :
                {
                    name : req.body.Username

                }
            }
        },
        {
            safe: true
        }

        ,function(err,user){
            if(user!=null)
                return res.end("success");
            return res.end("echec");
        });
});
router.post('/user/friends/requestRemove',function(req,res){
    User.update(
        {
            username: req.body.user
        },
        {
            $pull:
            {
                'friends':
                {
                    name: req.body.userToAdd
                }
            }
        },
        function(err,user) {
            res.end();
        });
});
router.get('/user/friends/requests/count',function(req,res){
    User.findOne({username:req.query.username},function(err,user) {
        if(user == null){
            return res.status(400).end();
        }
        res.json(user.friends
            .filter(function (elem) {
                return !elem.accepted;
            })
            .length);
    });

});
router.get('/user/friends/requests',function(req,res){
    User.findOne({username:req.query.username},function(err,user){
        console.log(user.friends
            .filter(function(elem) {
                return ! elem.accepted;}));

        res.json(user.friends
            .filter(function(elem) {
                return ! elem.accepted;
            }));
    });
});
router.get('/user/friends/already',function(req, res){
    User.findOne({'username': req.query.user}, function(err, user){
        if(err){ console.log(err); return; }

        console.log("[Query] get friends of " + JSON.stringify(user));
        if(user==null) {
            console.log("[Query] user is undefined");
            return res.end("echecUser");
        }
        var i = 0;
        User.findOne({
                username: req.query.user,
                'friends.name': req.query.userFriends,
                'friends.accepted': true
            }
            , function (err, user) {
                if (user != null)
                    i++;
            }
        );
        User.findOne({
            username: req.query.userFriends,
            'friends.name': req.query.user,
            'friends.accepted': true
        }, function (err, user) {
            if (user != null)
                i++;
            if (i == 2) res.end("success");
            else res.end("echec");
        });
    });
});
router.post('/user/friends/remove',function(req,res){
   User.update(
        {
            username: req.body.user
        },
        {
            $pull:
            {
                'friends':
                {
                    name: req.body.friendsName
                }
            }
        },
        function(err,user) {

            });
    User.update(
        {
            username: req.body.friendsName
        },
        {
            $pull:
            {
                'friends':
                {
                    name: req.body.user
                }
            }
        },
        function(err,user)
        {
            if(user!=null)
                i++;
            if(i==2)
                res.end("success");
            res.end("echec");
        }
    );
});
router.get('/user/exist',function(req,res){
    var i=0;
    User.findOne(
        {
            username: req.query.currentUser,
            'friends.name': req.query.username
        },
        function(err,user){
            if(user!=null)
                i++;
        }
    );
    User.findOne({
            username: req.query.username,
            'friends.name': req.query.currentUser
        },
        function(err,user){
            if(user!=null)
                i++;
            if(i>=1) res.end("true");
            res.end("false");
    });

});
router.post('/user/block',function(req,res){
    User.findOneAndUpdate({username:req.body.username},{
            $addToSet:{
                blackList  :
                {
                    name : req.body.usernameBlock

                }
            }
        },
        {
            safe: true
        }

        ,function(err,user){
            if(user!=null)
                console.log("user",user);
        });
    User.findOneAndUpdate(
        {
            username:req.body.username
        },
        {
            $pull:
            {
                friends:
                {
                    name:req.body.usernameBlock
                }
            }
        }
    );
    User.findOneAndUpdate(
        {
            username:req.body.usernameBlock
        },
        {
            $pull:
            {
                friends:
                {
                    name:req.body.username

                }
            }
        },function(err,user){
         console.log("userfriends",user);
        }

    );
    res.end("success");
});
router.post('/user/unblock',function(req,res){
    User.update({username:req.body.username},{
            $pull:{
                blackList  :
                {
                    name : req.body.usernameBlock

                }
            }
        },
        {
            safe: true
        }

        ,function(err,user){
            if(user!=null)
                res.end("success");
        });

});
router.post('/user/picture/change',function(req,res) {

    var id = req.body.userId;
    fs.rename(req.files['picture'].path, 'app/img/UserPictures/' + req.files['picture'].name, function(err, data) {
        if(err) return res.status(424).end();

        User.findOneAndUpdate(
            { _id:id},
            { picture: req.files['picture'].name },
            { safe:true },
            function(err,data) {
                if(err) return res.status(400).end();
                res.end(req.files['picture'].name);
            }
        )
    });
});

router.get('/user/activity',function(req,res) {
    var user = req.query.userName;
    Commentaires
        .find({user: user})
        .lean()
        .exec(function(err, comments) {
            if(err|| !comments) return res.status(424).end();
            User
                .findOne({username: user})
                .select('_id friends reads')
                .lean()
                .exec(function(err,users) {
                    if(err || !users || users.reads == undefined ) return res.status(424).end();
                    OeuvreModel
                        .find
                        ({
                            $or :
                            [
                                {
                                    _id:{
                                        $in: comments
                                            .map(function(elem) {
                                                return elem.id_oeuvre;
                                            })
                                            .concat(users.reads
                                                .map(function(elem) {
                                                    return elem.idOeuvre;
                                                })
                                            )
                                    }
                                },
                                { 'chapter.$.ratings.idUser':user._id }
                            ]
                        })
                        .lean()
                        .exec(function(err,data) {
                            if(err) return res.status(424).end();
                            for(var i in comments) {
                                var oeuvres = data.filter(function(elem) {
                                    return elem._id == comments[i].id_oeuvre;
                                });
                                comments[i].oeuvre = oeuvres[0];
                            }
                            for(var i in users.reads) {
                                users.reads[i].oeuvre = data.filter(function(elem) {
                                    return elem._id == users.reads[i].idOeuvre;
                                })[0];
                                if(users.reads[i].oeuvre) {
                                    users.reads[i].chapter = users.reads[i].oeuvre.chapters.filter(function(elem) {
                                        return elem._id == users.reads[i].idChapter;
                                    })[0];
                                }
                            }
                            var ratings = [];
                            for(var i in data) {
                                for(var j in data[i].chapters) {
                                    for(var h in data[i].chapters[j].ratings) {
                                        console.log('user', data[i].chapters[j].ratings[h]);
                                        if(data[i].chapters[j].ratings[h].user == user) {
                                            ratings.push({
                                                date: data[i].chapters[j].ratings[h].date,
                                                rating: data[i].chapters[j].ratings[h].rating,
                                                idChapter: data[i].chapters[j]._id,
                                                idOeuvre: data[i]._id,
                                                nomOeuvre: data[i].name,
                                                nomChapitre: data[i].chapters[j].name
                                            });
                                            break;
                                        }
                                    }
                                }
                                for(var k in data[i].ratings) {
                                    if(data[i].ratings.user == user) {
                                        ratings.push ({
                                            date: data[i].ratings[h].date,
                                            rating: data[i].ratings[k].rating,
                                            idOeuvre: data[i]._id,
                                            nomOeuvre: data[i].name
                                        });
                                        break;
                                    }
                                }
                            }
                            res.json({
                                comments: comments.filter(function(elem) {
                                    return elem.oeuvre && elem.chapter;
                                }),
                                friends: users.friends.filter(function(elem) {
                                    return elem.accepted;
                                }),
                                reads: users.reads.filter(function(elem) {
                                    return elem.oeuvre;
                                }),
                                ratings: ratings
                            });
                        });
                });
        });

});

router.post('/user/remove/interested',function(req,res) {
    var user = req.body.userId;
    var oeuvre = req.body.oeuvreId;
    console.log(user);
    console.log(oeuvre);
    User.findOneAndUpdate
    (
        {
            _id: user
        },
        {
            $pull:
            {
                interested:
                {
                    idOeuvre: oeuvre
                }
            }
        },
        {
            safe: true
        },
        function(err,data) {
            if(err) return res.status(424).end();
            console.log(data);
            res.end();
        }
    )
});
router.get('/user/list/intersted',function(req,res){
    console.log("username",req.query.username);
    User
        .findOne({username : req.query.username})
        .select('interested')
        .lean()
        .exec(function(err, interested) {
            if(err) console.log(err);
            interested = interested.interested;
            OeuvreModel
                .find(
                {_id: {$in:interested.map(function(d) {
                    return d.idOeuvre
                })
                }})
                .select('name _id')
                .lean()
                .exec(function(err, oeuvre) {
                    if(err) console.log(err);
                    for(var i in interested) {
                        interested[i].nomOeuvre = oeuvre
                            .filter(function(e) {
                                return interested[i].idOeuvre == e._id;
                            })
                            .map(function(e) {
                                return e.name;
                            })[0]
                    }
                    res.json(interested).end();
                })
        })
})
router.post('/user/add/interested',function(req,res) {
    var user = req.body.userId;
    var oeuvre = req.body.oeuvreId;
    User.findOneAndUpdate
    (
        {
            _id: user
        },
        {
            $addToSet:
            {
                interested:
                {
                    idOeuvre: oeuvre
                }
            }
        },
        {
            safe: true
        },
        function(err) {
            if(err) return res.status(424).end();
            return res.end();
        }
    )
});

router.get('/user/interested',function(req,res) {
    var user = req.query.userId;
    var oeuvre = req.query.oeuvreId;
    console.log('user',user);
    console.log('oeuvre',oeuvre);
    User
        .find({
            _id: user,
            'interested.idOeuvre':oeuvre
        })
        .exec(function(err,data) {
            if(err) return res.status(424).end();
            res.json({result: data.length != 0});
        })
});

router.get('/user/isBlock',function(req,res){
    User.findOne({'username': req.query.username}, function(err, user){
        if(err){ console.log(err); return; }

        console.log("[Query] get Black List of " + JSON.stringify(user));
        if(user==null) {
            console.log("[Query] user is undefined");
            res.end("echecUser");
            return;
        }
        User.findOne({
                username: req.query.username,
                'blackList.name': req.query.usernameBlock
            }
            , function (err, user) {
                if (user != null)
                    return res.end("is_in_my_list");

            }
        );
        User.findOne({
            username: req.query.usernameBlock,
            'blackList.name': req.query.username
        }, function (err, user) {
            if (user != null)
                return res.end("i_am_in_his_list");
            return res.end("false");
        });
    });
});


module.exports = router;