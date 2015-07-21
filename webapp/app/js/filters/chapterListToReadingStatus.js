/**
 * Created by arjuna on 09/07/15.
 */
var ReadIT = angular.module('readIt');
ReadIT.filter('readingStatus',function(auth) {
    if(!auth.isLoggedIn())
        return '';

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