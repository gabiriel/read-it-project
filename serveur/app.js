var http = require('http');
var url = require('url');
var express = require('express');
var path = require('path');
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var tsvimport = require("./import_tsv");
var multer = require('multer');
var passwordHash = require('password-hash');
var site_email="suivi.mangas@gmail.com";
var site_pass="Suivi.Manga";
var site_service="Gmail";
// créer token pour recuperation du mdp
var crypto = require('crypto');
var async = require('async');

var nodemail = require('nodemailer');
var transport = nodemail.createTransport({
    service:site_service,
    auth:{
        user:site_email,
        pass:site_pass
    }
});


var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(multer({ dest: './uploads/'}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret:'secret'}));
app.use(express.static('../webapp/app'));
app.use('/import', tsvimport);


http.createServer(app).listen(app.get('port'), function(req,res){
    console.log('Express server listening on port ' + app.get('port'));
});
mongoose.connect('mongodb://localhost:27017/readIt', function(err) {
    console.log('Trying to connect to Mongodb');
 if (err)
     console.log("'Connection to MongoDB [ERROR] :"+err);
 else
    console.log('Connection to MongoDB [SUCCESS]');
});


////////////////////Creation du schema de la base////////////////////////////////////////////////////////////////////
var users = new mongoose.Schema({
    userName :Object,
    firstName : Object,
    lastName : Object,
    mail : Object,
    password : Object
 });
var usersModel = mongoose.model('users', users);

var usersforgotpwd = new mongoose.Schema({
   mail:Object,
   resetPasswordToken:Object
});
var usersforgotpwdModel = mongoose.model('usersforgot', usersforgotpwd);


app.post('/',function(req,res) {
    var dataToSave = new usersModel({firstName: req.body.firstName});
    dataToSave.lastName = req.body.lastName;
    dataToSave.mail = req.body.mail;
    dataToSave.password = req.body.password;
    dataToSave.save(function (err) {
        if (err) {
            throw err;
        }
        console.log('Commentaire ajouté avec succees !');
    });
    res.end();
});

app.post('/inscriptionuser',function(req,res) {
    var monuser=req.body;
    /* créer Exemplaire à envoyer aux nouveaux utilisateurs */

    var ExemplaireText='<h4>Bonjour Cher(e) <b>'
            +monuser.firstName+'</b> ;</h4></br>'
            +'Merci pour votre inscription,Voici vos coordonnées:</br>'
            +'Votre username : ' +monuser.userName+'</b> ;</h4></br>'
            +'Pour des informations, n\'hésitez pas à nous contacter sur email : '+site_email
        ;

    // Créer OptionMail
    var mailOptions = {
        from: 'Suivi Manga ✔ <'+site_email+'>', // sender address
        to: monuser.mail, // list of receivers
        subject: 'inscription', // Subject line
        html: ExemplaireText // html body
    };
    usersModel.find({$and:[ {mail:monuser.mail},{userName:monuser.userName}]}, function (err,data) {
        // Erreur db
        if(err)
            res.send("Erreur de chargement de Bd ");
        else{
            // Pas users avec ce email
            if(data.length>0)
                res.send("username ou (et) email Deja Crée");
            else{
                //créer user
                var dataToSave = new usersModel({firstName : monuser.firstName});
                dataToSave.userName = monuser.userName;
                dataToSave.lastName = monuser.lastName;
                dataToSave.mail = monuser.mail;
                dataToSave.password = passwordHash.generate(monuser.password);
                //Sauvegarde au Db
                dataToSave.save(function (err) {
                    //Erreur au sauvegarde
                    if (err)
                        res.send("Erreur au sauvegarde user : "+err);
                    else
                        var msg="Utilisateur sauvegardé";
                        transport.sendMail(mailOptions, function(error, response){
                            if(error){
                                res.send(msg+' et erreur à l\'envoi mail : '+error);
                            }
                            else{
                                res.send("OK");
                            }
                        transport.close();
                    });
                });
            }
        }
    });
});

app.post('/connexion', function (req, res){
    var Mesparams = req.body;

    usersModel.find({mail:Mesparams.mail},function(err,data){
        if(err)
            res.send(err);
        else
            if (data.length==0)
                res.send('Email invalide');
            else
                if(passwordHash.verify(Mesparams.password, data[0].password))
                    res.send("OK");
                else
                    res.send("Mot de passe est faux");
    })
});

app.post('/contact', function (req, res){
    var Mesparams = req.body;

    usersModel.find({mail:Mesparams.mail},function(err,data){
        if(err)
            res.send(err);
        else
        if (data.length==0)
            res.send('Email invalide');
        else
        if(passwordHash.verify(Mesparams.password, data[0].password))
            res.send("OK");
        else
            res.send("Mot de passe est faux");
    })
});


app.post('/forgotpassword',function(req,res) {
    var monuser = req.body;
    usersModel.find({mail:monuser.mail}, function (err,data) {
        //erreur db
        if(err){
            res.send('erreur de db - users');
        }else{
            if(data.length>0){
                usersforgotpwdModel.find({mail:monuser.mail},function(err,data){
                    if(err){
                        res.send('Erreur de db - forgot');
                    }else{
                        if(data.length>0){
                            res.send('Vous avez déja demandé de récuperation du mot de passe.');

                        }else{
                            var tokenCree = crypto.randomBytes(10).toString('hex');
                            console.log(tokenCree);
                            //creé un token
                            var tokenToSave = new usersforgotpwdModel();
                            tokenToSave.mail=monuser.mail;
                            tokenToSave.resetPasswordToken=tokenCree;
                            tokenToSave.save(function (err) {
                               //erreur au sauvegarde
                                if(err){
                                    res.send("erreur au sauvegarder token :"+err);
                                }else{
                                    /* créer Exemplaire à envoyer pour la récuperation du mdp */
                                    var ExemplaireText ='Pour changer votre mot de passe, il faut cliquer '
                                    +'<a href=http://' + req.headers.host + '/#/user/reset/?token=' + tokenCree
                                    +'>Ici</a></br><b>Ce lien fonctionne qu\'une seule fois .</b>'

                                    var mailOptions = {
                                        from: 'Suivi Manga ✔ <' + site_email + '>', // sender address
                                        to: monuser.mail, // list of receivers
                                        subject: 'Récuperation du mot de passe', // Subject line
                                        html: ExemplaireText // html body
                                    };
                                    var msg = "Utilisateur sauvegardé";
                                    transport.sendMail(mailOptions, function (error, response) {
                                        if (error) {
                                            res.send(msg + ' et erreur à l\'envoi mail : ' + error);
                                        }
                                        else {
                                            res.send("OK");
                                        }
                                        transport.close();
                                    });

                                }
                            });

                        }
                    }
                });
            }
        }

    });

});


app.post('/user/reset/',function(req,res) {
    var montoken=req.body;
        usersforgotpwdModel.findOneAndRemove({resetPasswordToken:montoken.token},function(err,data){
      if(err){
     res.send("erreur db");
      }else{
          if(data){
                usersModel.findOneAndUpdate({mail:data.mail},{password:passwordHash.generate(montoken.password)},function(err,data){
                    if(err){
                        res.send('erreur db users');

                    }else{
         res.send('OK');

                    }
                });
          }else{
              res.send("Ce lien ne fonctionne plus.");
          }
      }
  });

});
