var http = require('http');
var url = require('url');
var express = require('express');
var path = require('path');
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');

/** MongoDB
*************************************************/
var url_mongodb ={
    local: "mongodb://localhost:27017/readIt",
    prod: "mongodb://root:toor@ds047772.mongolab.com:47772/read_it"
};
var mongoose = require('mongoose');
var url_mongodb_in_use = url_mongodb.local;
mongoose.connect(url_mongodb_in_use, function(err) {
    console.log("Trying to connect to Mongodb :" + url_mongodb_in_use);
    if (err){
        console.log("Connection to MongoDB [ERROR]");
        throw err;
    }
    console.log("Connection to MongoDB [SUCCESS]");
});

/** Data Models (for MongoDB)
 * !! Should be before Routes definition !!
 *************************************************/
require('./models/Users');
require('./models/UsersForgotPassword');
require('./models/CalendarEvent');
require('./models/Commentaire');
require('./models/Sondages');
require('./config/passport');

/** TSV import
 *************************************************/
var tsvimport = require("./import_tsv");
var multer = require('multer');

/** Routes
 *************************************************/
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

/** Server HTTP
 *************************************************/
app.set('port', process.env.PORT || 3000);
app.set('secret', '$eucrèt');

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(multer({ dest: './uploads/'}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret:app.get('secret')}));
app.use(express.static(path.join(__dirname, 'app')));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);
app.use('/users', users);
app.use('/import', tsvimport);

/** Create HTTP Server
 *************************************************/
http.createServer(app).listen(app.get('port'), function(req,res){
    console.log('Express server listening on port ' + app.get('port'));
});

var User = mongoose.model('User');
var UserForgotPwd = mongoose.model('UserForgotPassword');
var CalendarEvent = mongoose.model('CalendarEvent');
var OeuvreModel = mongoose.model('Oeuvre');
var Commentaire = mongoose.model('Commentaires');
var Sondages = mongoose.model('Sondages');
