var app = angular.module('readIt');
app.controller('AuthController', ['$scope', '$state', 'auth', function($scope, $state, auth){
    $scope.user = {};
    $scope.auth = auth;

    $scope.register = function(){
        auth.register($scope.user).error(function(error){
            $scope.error = error;
        }).then(function(){
            $state.go('home');
        });
    };

    $scope.logIn = function(){
        auth.logIn($scope.user).error(function(error){
            $scope.error = error;
        }).then(function(){
            $state.go('home');
        });
    };

    $scope.reset = function(){
        $scope.user.clear();
    };

}]);