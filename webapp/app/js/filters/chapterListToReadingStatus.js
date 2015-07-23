/**
 * Created by arjuna on 09/07/15.
 */
var ReadIT = angular.module('readIt');
ReadIT.filter('readingStatus',function(auth) {
    if(!auth.isLoggedIn())
        return function(oeuvre) {return 'Pas commencé'};

    return function(oeuvre) {
        if(oeuvre == undefined || oeuvre.chapters == undefined)
            return '';

        var read = function(elem) {
            return elem.read;
        };

        var reading = oeuvre.chapters.some(read);
        var finished = oeuvre.chapters.every(read);
        var interested = oeuvre.interested;
        if (finished)
            return 'Terminé';
        if (reading)
            return 'En cours';
        if(interested)
            return 'Interessé';
        return 'Pas commencé';
    };
});
ReadIT.filter('prettyUrl',function() {
    return function(url) {
        if(!url) return '';
        var domain;
        //find & remove protocol (http, ftp, etc.) and get domain
        if (url.indexOf("://") > -1) {
            domain = url.split('/')[2];
        }
        else {
            domain = url.split('/')[0];
        }

        //find & remove port number
        domain = domain.split(':')[0];

        return domain;
    };
});