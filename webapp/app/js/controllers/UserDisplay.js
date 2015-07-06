var app = angular.module('readIt');
app.controller('UserPage',['$scope', 'auth', function($scope, auth){

    //=== Variables ===//
    auth.getUser(auth.currentUser()).success(function(data){
        $scope.user = data.firstname +" "+data.lastname;

    });
    $scope.imgSource ="img.jpg"//donnée le lien vers limage de profile de chaque utilisateur ;
    $scope.auth = auth;

}]);
