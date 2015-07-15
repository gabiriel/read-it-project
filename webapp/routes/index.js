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
var Commentaires = mongoose.model('Commentaires');
var Sondages = mongoose.model('Sondages');

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
        if (err) { return res.status(400).json({message: err }); }
        if (userFromDB.length>0){
            console.log("User already exists !");
            return res.status(400).json({message: 'This user already exists' });
        }
    });
    console.log("New user !");
    newUser.setPassword(formUser.password);

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
    return res.json({alertmessage: "Le compte a été créé"});
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

        UserForgotPwd.findOneAndRemove({mail: formUser.mail}, function(err,data){
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
    OeuvreModel.findOneAndUpdate(
        { '_id': req.query.id_Oeuvre },
        { $inc: { accessCount: 1 } },
        { safe: true },
        function (err, oeuvre) {
            if (err) { throw err;}
            console.log("[Mongoose] oeuvre has been successfuly retrieved");
            //console.log(oeuvre.chapters)
            console.log(oeuvre);
            for(var i in oeuvre.chapters) {
                //on modifie oeuvre pour avoir le numero a chaque fois
                if(oeuvre.chapters[i].ratings) {
                    //oeuvre.chapters[i].rating = oeuvre.chapters[i].ratings.reduce(
                    //        function(c,n) {
                    //            return c + n;
                    //        }, 0) / oeuvre.chapters[i].ratings.length;
                    //oeuvre.chapters[i].ratings = undefined;
                }
            }
            console.log(oeuvre);
            res.json(oeuvre);
        }
    );
});
router.post('/commentaire', function(req,res) {
    var commentaire = new Commentaires({
     user : req.body.user,
     id_oeuvre : req.body.id,
     commentaire :req.body.commentaire
     });
    commentaire.save(function (err) {
        if (err) { throw err; }
    });

});

router.get('/comments', function(req,res) {
    var query = Commentaires.find(null);
    query.where("id_oeuvre", req.query.id_Oeuvre);
    query.exec(function (err, comms) {
        if (err) { throw err;}
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
            if (err) console.log("[Mongoose] - " + err);
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
            if (err) console.log("[Mongoose] - " + err);
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
                res.end('false');
                return;
            }
            console.log('[Mongoose] Favorite founded(' + count + ')');
            res.end(String(count !== 0));
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
                res.json({failure:true});
                return;
            }
            res.json(populaires);
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
            if(err) throw err;
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
                    if(err)
                        throw err;
                    res.json({rating: data.ratings.reduce(function(x,y) { return x + y.rating; }, 0) /data.ratings.length});
                    ////thread safe ?
                    //OeuvreModel.findOneAndUpdate(
                    //    {
                    //        id: idOeuvre
                    //    },
                    //    {
                    //        averageRating:
                    //    },
                    //    {
                    //        safe: true
                    //    },
                    //    function(err,data) {
                    //        if(err)
                    //            throw err;
                    //    }
                    //)
                });
        }
    );
    //OeuvreModel
    //    .findOneAndUpdate(
    //        {
    //            _id: idOeuvre,
    //            'ratings.$.user':user
    //        },
    //        {
    //            'ratings.rating':rating
    //        },
    //        {
    //            safe:true
    //        }
    //    )
    //    .exec(function(err, populaires) {
    //        if(err) {
    //            console.log(err);
    //            res.json({failure:true});
    //            return;
    //        }
    //        res.json(populaires);
    //    });
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
            res.json({ rating: data.reduce(function(x,y) { return x + y; }) /data.length || 0});
        });
});
router.get('/oeuvre/well_rated',function(req,res) {
    OeuvreModel
        .find()
        .exec(function(err,data) {
            //data contains all oeuvre
            if(err) {
                console.log(err);
                res.json({failure:true});
                return;
            }
            res.json(
                data
                    .map(function(oeuvre) {
                        return {
                            _id:oeuvre._id,
                            name: oeuvre.name,
                            rating:
                                oeuvre.ratings
                                    ? oeuvre.ratings.reduce(function(x,y) { return x + y.rating; }, 0) / oeuvre.ratings.length
                                || 0
                                    : 0
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
                res.end("failure");
                return;
            }
            res.end('success');
        }
    );
});

router.post('/oeuvre/read',function(req,res) {
    var user = req.body.user;
    var idChapter = req.body.idChapter;
    console.log(user + ' has read ' + idChapter + ' from ' + idOeuvre);
    OeuvreModel
        .find({

        })
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
                        res.end("failure");
                        return;
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
    User.findOne({username: currentUser
    },function (err, user) {
        res.json(user);
    });
});
router.get('/Users',function(req,res) {
    console.log(req.query.currentUser);

    User.find({username:
            {
                $ne:req.query.currentUser
            }
        }
        ,function (err, users)
        {
            res.json(users);
        }
    );
});
router.get('/users/search',function(req,res) {
    var searched = req.query.searched;
    User.
        find({username: {$regex: searched, $options: "i" }})
        .exec(function(err, data) {
            if(err) {
                console.log('error : ' + err);
                res.end("error");
                return;
            }
            console.log('data ' + data);
            res.json(data);
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
        if(err) return res.status(400).json({message: 'Error when updating user (' + formUser._id + ') : ' + err});

        console.log("Update success");
        res.status(200).send("l'utilisateur a été modifié");
    });
});

router.post('/messages',function(req,res) {

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
            console.log(user);
    });

});
router.get('/DetailUser',function(req,res) {
    console.log(req.query.currentUser);

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
    OeuvreModel.create(req.body.oeuvre,function(err, data){
        if(err) {
            res.end('error');
            return;
        }
        res.end('success');
    });
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
                   userId: req.userId
                }
            }
        },
        function(err, data) {
           if(err) {
               throw err;
           }
           OeuvreModel.findOneAndUpdate(
               {
                   _id: req.body.oeuvreId,
                   'chapters._id': req.body.chapterId
               },
               {
                   $addToSet: {
                       'chapters.$.ratings':{
                           userId: req.body.userId,
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
                       throw err;
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
            if(err) throw err;
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
router.post('/sondage/create', function (req,res) {
    var questionSondage=req.body.question;
    var responseSondage=req.body.reponses;
    var newSondage=new Sondages({
        question:questionSondage,
        reponses:responseSondage
    });
    console.log("New Sondage !");
    newSondage.save(function (err,sondages) {
        if (err) {
            return res.status(400).json({message: 'Error when saving Sondage : ' + err});
        }else
            return res.json(sondages);
    });
});
router.get('/Sondages',function(req,res) {
    Sondages.find({}
        ,function (err, sondages)
        {
            res.json(sondages);
        }
    );
});
router.post('/sondage/delete',function(req,res){
    Sondages.findOneAndRemove({_id: req.body._id},function(err,sondages){
        if (err) {
            console.log(err);
        }else{
           res.json(sondages);
        }
    });
});
router.post('/sondage/modify',function(req,res){
    var detail = req.body;

    var query = {_id: detail._id};
    var updates = {
        question: detail.question,
        reponses: detail.reponses
        };

    Sondages.findOneAndUpdate(query, updates, function (err, user) {
        if (err) return res.status(400).json({message: 'Error when updating sondage (' + detail._id + ') : ' + err});

        console.log("Update success");
        res.status(200);
    })
});
router.post("/sondage", function (req,res) {
    var id = req.body._id;
    Sondages.findOne({_id: id
    },function (err, user) {
        if (err) return res.status(400).json({message: 'Error when display sondage (' + req.body.id + ') : ' + err});
        res.json(user);
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
                    accepted : true

                }
            }
        },
        {
            safe: true
        }

        ,function(err,user){
            console.log("userna",user);
            if(user!=null)
                i++;
        });
    console.log("usertoadd",req.body.user);
    User.findOneAndUpdate({username:req.body.user, 'friends.name':req.body.userToAdd},
        {
            $set:
            {
                'friends.$.accepted' :true}
        },
        {
            safe: true
        }

        ,function(err,user){
            console.log("firens",user);
            if(user!=null)
                i++;
            if(i==2) res.end("success");
            else res.end("echec");
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
                console.log("user",user);
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
            console.log(user);
        });
});
router.get('/user/friends/requests/count',function(req,res){
    User.findOne({username:req.query.username},function(err,user) {
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
router.get('/user/friends/already',function(req,res){
    var i=0;
    User
        .findOne(
        {
            username:req.query.user,
            'friends.name': req.query.userFriends ,
            'friends.accepted':true
        }
        ,function(err,user)
        {
            if(user!=null)
                i++;
        }
    );
    User.findOne({username:req.query.userFriends, 'friends.name': req.query.user,'friends.accepted':true },function(err,user){
        if(user!=null)
            i++;
        if(i==2) res.end("success");
        else res.end("echec");
    });
});
router.post('/user/friends/remove',function(req,res){
    var i=0;
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
            if(user!=null)
                i++;

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
        function(err,user) {
            if(user!=null)
                i++;
            if(i==2)
                res.end("success");
            res.end("echec");
        });
});
router.get('/user/exist',function(req,res){
    User.findOne(
        {
            username: req.query.currentUser,
            'friends.name': req.query.username
        },
        function(err,user){
            if(user!=null)
                res.end("true");
            res.end("false");
        }
    )
});
module.exports = router;