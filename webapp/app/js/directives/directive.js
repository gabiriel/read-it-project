/**
 * Created by macbookpro on 13/06/15.
 */
var readIt = angular.module('readIt');
readIt.directive('validPasswordC', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue, $scope) {
                var noMatch = viewValue != scope.userForm.password.$viewValue;
                ctrl.$setValidity('noMatch', !noMatch)
            })
        }
    }
});