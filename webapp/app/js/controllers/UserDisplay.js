var app = angular.module('readIt');
app.controller('UserPage',['$scope', 'auth', function($scope, auth){

    //=== Variables ===//
    $scope.user="ghersi cherifa";
    $scope.imgSource ="img.jpg"//donnée le lien vers limage de profile de chaque utilisateur ;
    $scope.auth = auth;
}]);
