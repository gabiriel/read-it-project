/**
 * Created by Hedhili on 13/07/2015.
 */
var mongoose = require('mongoose');

var Sondages = new mongoose.Schema({
    question : String,
    reponses : [{
        name: String,
        rep: String,
        Numvote: { type: Number, default: 0}
    }]
});

mongoose.model('Sondages', Sondages);