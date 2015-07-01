var mongoose = require('mongoose');

var Commentaires = new mongoose.Schema({
    user : String,
    id_oeuvre : String,
    commentaire : Object
});

mongoose.model('Commentaires', Commentaires);