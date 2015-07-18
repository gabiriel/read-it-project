var mongoose = require('mongoose');

var Commentaires = new mongoose.Schema({
    user : String,
    id_oeuvre : String,
    commentaire : Object,
    date : Date
});

mongoose.model('Commentaires', Commentaires);