/**
 * Created by arjuna on 17/06/15.
 */
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
    if(number !==  undefined && typeof number !== 'number')
        throw new WrongArgumentException('Chapter', 'number','number',typeof(number));
    if(pageNumber !== undefined && typeof pageNumber !== 'number')
        throw new WrongArgumentException('Chapter', 'pageNumber','number',typeof(pageNumber));

    this.pageNumber = pageNumber || 0;
    this.name = name;
    this.number = number || 0;
    this.resume = resume;
    this.date = new Date(date, 'DD/MM/YYYY') || new Date(date,'YYYY') || undefined;
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
    this.accessCount = 0;
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
        throw new WrongArgumentException('stringToCsv','separator','string', typeof separator);
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
    var lastOeuvre = null;//pour vérifier si on a des nouveau chapitre
    for(var i in csv) {
        if(lastOeuvre === csv[i].Titre_de_la_série) {
            //on ajoute un nouveau chapitre a l'euvre
            Oeuvres[Oeuvres.length - 1].chapters.push(new Chapter(
                csv[i].Titre_du_chapitre,
                parseInt(csv[i].Numéro_de_chapitre) ,
                csv[i].Résumé,
                parseInt(csv[i].Nombre_de_pages),
                csv[i].Date_de_parution_originale
            ));
        }else {
            //on ajoute une nouvelle oeuvre
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

module.exports = stringToTsv;