/**
 * Created by macbookpro on 13/06/15.
 */
var readIt = angular.module('readIt');

readIt.directive('equalsTo', [function () {
    return {
        restrict: 'A',
        scope: true,
        require: 'ngModel',
        link: function (scope, elem, attrs, control) {
            var check = function () {
                //Valeur du champs courant
                var v1 = scope.$eval(attrs.ngModel); // attrs.ngModel = "password_conf"
                //valeur du champ à comparer
                var v2 = scope.$eval(attrs.equalsTo).$viewValue; // attrs.equalsTo = "Password"
                return v1 == v2;
            };
            scope.$watch(check, function (isValid) {
                // le champ est valide
                control.$setValidity("equalsTo", isValid);
            });
        }
    };
}]);
readIt.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);