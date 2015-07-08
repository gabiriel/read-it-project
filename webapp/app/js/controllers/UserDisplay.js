var app = angular.module('readIt');
app.controller('UserPage',['$scope', '$stateParams', 'auth', function($scope, $stateParams, auth){
    var user = $stateParams.user;

    //=== Variables ===//
    auth.getUser(user).success(function(data){
        $scope.user = data.firstname +" "+data.lastname;

    });
    $scope.imgSource ="img.jpg"//donnée le lien vers limage de profile de chaque utilisateur ;
    $scope.auth = auth;

}]);
