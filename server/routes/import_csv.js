/**
 * Created by arjuna on 13/06/15.
 */
var express = require('express');
var router = express.Router();
var fs = require("fs");
/**
 * Created by arjuna on 24/04/15.
 */
//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/my_database_name';
var util = require('util');

function WrongArgumentException(func, variable, expected, actual) {
    this.expected = expected;
    this.variable = variable;
    this.actual = actual;
    this.func = func;
}

function Chapter(name, number, resume, pageNumber, date) {
    if(typeof name !== 'string')
        throw new WrongArgumentException('Chapter', 'name','string',typeof(name));
    if(typeof resume !== 'string')
        throw new WrongArgumentException('Chapter', 'resume','string',typeof(resume));
    if(typeof number !== 'number')
        throw new WrongArgumentException('Chapter', 'number','number',typeof(number));
    if(typeof pageNumber !== 'number')
        throw new WrongArgumentException('Chapter', 'pageNumber','number',typeof(pageNumber));

    this.pageNumber = pageNumber;
    this.name = name;
    this.number = number;
    this.resume = resume;
    this.date = date;
}

function Oeuvre(name, type, author, category){
    if(typeof name !== 'string')
        throw new WrongArgumentException('Oeuvre', 'name','string',typeof name);
    if(typeof type !== 'string')
        throw new WrongArgumentException('Oeuvre', 'type','string',typeof type);
    if(author.constructor !== Array)
        throw new WrongArgumentException('Oeuvre','author','Array',typeof category);
    if(typeof  category !== 'string')
        throw new WrongArgumentException('Oeuvre','category','string',typeof category);

    this.type = type;
    this.name = name;
    this.author = author;
    this.category = category;
    this.chapters = [];
}
function DynamicObject(names,values) {
    if(names.constructor !== Array)
        throw new WrongArgumentException('DynamicObject', 'names','string',typeof names);
    if(values.constructor !== Array)
        throw new WrongArgumentException('DynamicObject', 'values','values',typeof(values));

    for(var i =0; i < names.length && i < values.length; ++i)
        this[names[i].trim().replace(/ /g,'_')] = values[i];
}

// CSV is string
function stringToCsv(toParse,separator) {
    if(typeof toParse !== 'string')
        throw new WrongArgumentException('stringToCsv', 'toParse','string',typeof toParse);
    if(typeof separator !== 'string')
        throw new WrongArgumentException(('stringToCsv','separator','string',typeof  separator))
    var result = [];
    var lines = toParse.split('\n');
    var titles = lines[0].split(separator);

    for(y = 1; y < lines.length; ++y)
        result[y-1] = new DynamicObject(titles, lines[y].split(separator));
    return result;
}

function stringToTsv(toParse) {
    if(typeof(toParse) !== 'string')
        throw new WrongArgumentException('stringToTsv', 'toParse','string',typeof(toParse));
    var Oeuvres = [];
    var csv = stringToCsv(toParse,'\t');
    var lastOeuvre;//pour vérifier si on a des nouveau chapitre
    for(var i in csv) {
        if(lastOeuvre === csv[i].Titre_de_la_série) {
            //on ajoute un nouveau chapitre a l'euvre
            Oeuvres[Oeuvres.length - 1].chapters.push(new Chapter(
                csv[i].Titre_du_chapitre,
                parseInt(csv[i].Numéro_de_chapitre),
                csv[i].Résumé,
                parseInt(csv[i].Nombre_de_pages),
                csv[i].Date_de_parution_originale
            ));
        }else {
            //on ajoute un nouvel oeuvre
            Oeuvres.push(new Oeuvre(
                csv[i].Titre_de_la_série,
                csv[i]["Type_d'oeuvre"],
                csv[i]['Auteur(s)'].split(',').map(function(s) { return s.trim(); }),
                csv[i].Genre
            ));
            Oeuvres[Oeuvres.length - 1].chapters.push(new Chapter(
                csv[i].Titre_du_chapitre,
                parseInt(csv[i].Numéro_de_chapitre),
                csv[i].Résumé,
                parseInt(csv[i].Nombre_de_pages),
                csv[i].Date_de_parution_originale
            ));
        }
        lastOeuvre = csv[i].Titre_de_la_série;
    }
    return Oeuvres;
}

/* GET home page. */
router.post('/do', function(req, res, next) {
    fs.readFile(req.files['to-import'].path, 'utf8', function(err, data) {
        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                //HURRAY!! We are connected. :)
                console.log('Connection established to', url);
                // do some work here with the database.
                var result = stringToTsv(data);
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
                });
            }
        });
    });

    //on affiche la validation
    res.render('import-success', { title: 'Express' });
});

router.get('/', function(req, res, next) {
    res.render('import', {});
});

module.exports = router;
