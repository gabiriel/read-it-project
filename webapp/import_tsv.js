/**
 * Created by arjuna on 17/06/15.
 */
/**
 * Created by arjuna on 13/06/15.
 */
var express = require('express');
var router = express.Router();
var fs = require("fs");
var tsv_parser = require("./tsv_transformer");
var mongoose = require('mongoose');

/**
 * Created by arjuna on 24/04/15.
 */
//lets require/import the mongodb native drivers.
//We need to work with "MongoClient" interface in order to connect to a mongodb server.

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/my_database_name';
var util = require('util');

var ChapterSchema =new mongoose.Schema({
    pageNumber : Number,
    name : String,
    number : Number,
    resume : String,
    date : Date
});
var RatingSchema = new mongoose.Schema({
    user : String,
    rating : Number
})
var OeuvreSchema = new  mongoose.Schema({
    type : String,
    title :String,
    name : String,
    author :[String],
    category : [String],
    chapters : [ChapterSchema],
    ratings : [RatingSchema],
    accessCount : Number
});
var OeuvreModel = mongoose.model('Oeuvre', OeuvreSchema);
//MongoClient.connect(url, function (err, db));
/* GET home page. */
router.post('/', function(req, res, ext) {
    fs.readFile(req.files['to-import'].path, 'utf8', function(err, data) {
        // Use connect method to connect to the Server
        try {
            var result = tsv_parser(data);
            result.forEach(function(oeuvre) {
                OeuvreModel.create(oeuvre,function(err) {
                    console.log(err);
                    console.log(data);
                });
            });
            res.end("success");
        }catch(e) {
            res.end("failure");
        }
        /*MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                //HURRAY!! We are connected. :)
                console.log('Connection established to', url);
                // do some work here with the database.
                var result = tsv_parser(data);
                var oeuvres = db.collection("Oeuvres");
                var chapitres = db.collection("Chapters");
                oeuvres.insert(result.map(function(oeuvre) {
                    return {
                        title : oeuvre.name,
                        type : oeuvre.type,
                        author : oeuvre.author,
                        category : oeuvre.category
                    };
                }),function(err,docsInserted) {
                    console.log(err);
                    console.log(docsInserted);
                    chapitres.insert(
                        result.map(function(o) {
                            var res = docsInserted.ops.filter(function(r) {return r.title == o.name; })[0];
                            return o.chapters.map(
                                function(c) {
                                    c.oeuvre = res._id;
                                    return c;
                                });
                        }).reduce(function(a,b) {
                            return a.concat(b);
                        })
                    );
                    db.close();
                    res.end("success");
                });
            }
        });*/
    });

    //on affiche la validation
    //res.render('import-success', { title: 'Express' });
});

module.exports = router;
