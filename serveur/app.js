var http = require('http');
var express = require('express');
var path = require('path');
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret:'secret'}));
app.use(express.static('../webapp'));

http.createServer(app).listen(app.get('port'), function(req,res){
    console.log('Express server listening on port ' + app.get('port'));
});
mongoose.connect('mongodb://localhost/users', function(err) {
    console.log('Trying to connect to Mongodb');
 if (err) { throw err; }
    console.log('Connection to MongoDB [SUCCESS]');
});


////////////////////Creation du schema de la base////////////////////////////////////////////////////////////////////
var users = new mongoose.Schema({
 firstName : Object,
 lastName : Object,
 mail : Object,
 password : Object
 });
var usersModel = mongoose.model('users', users);

app.post('/',function(req,res) {
    var dataToSave = new usersModel({firstName : req.body.firstName});
    dataToSave.lastName = req.body.lastName;
    dataToSave.mail = req.body.mail;
    dataToSave.password = req.body.password;
    dataToSave.save(function (err) {
            if (err) { throw err;}
            console.log('Commentaire ajouté avec succees !');
            res.end("succes");
        });
    res.end("succes");

});

