/**
 * Created by Hedhili on 13/07/2015.
 */
var mongoose = require('mongoose');
var Sondages = new mongoose.Schema({
    questions:[{
        question : String,
        reponses : [{
            name: String,
            rep: String,
            Numvote: { type: Number, default: 0}
        }],
        users : [{type: String, default: ''}]
    }],
    IdActive:{type : mongoose.Schema.ObjectId,default:null}
});

mongoose.model('Sondages', Sondages);