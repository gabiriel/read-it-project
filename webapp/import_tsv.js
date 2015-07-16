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
var util = require('util');

var RatingSchema = new mongoose.Schema({
    user : String,
    rating : Number
});
var ChapterSchema =new mongoose.Schema({
    pageNumber : Number,
    name : String,
    number : Number,
    resume : String,
    date : Date,
    ratings: [RatingSchema]
});
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
/* GET home page. */
router.post('/', function(req, res, ext) {
    fs.readFile(req.files['to-import'].path, 'utf8', function(err, data) {
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
    });
});

module.exports = router;
