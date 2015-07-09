/**
 * Created by arjuna on 09/07/15.
 */
var ReadIT = angular.module('readIt');
ReadIT.filter('readingStatus',function() {
    return function(chapters) {
        if(chapters == undefined)
            return '';

        var read = function(elem) {
            return elem.read;
        };

        var reading = chapters.some(read);
        var finished = chapters.every(read);

        if (finished)
            return 'finis';
        if (reading)
            return 'en cours';
        return 'pas commencé';
    };
});