var ReadIT = angular.module('readIt');
ReadIT.controller('NewUserController',['$scope','$location','serviceDetails',function($scope,$location,serviceDetails){
    $scope.save=function(){
        var userDetails= {
            userName: $scope.user.username,
            firstName : $scope.user.nom,
            lastName : $scope.user.prenom,
            mail : $scope.user.email,
            password : $scope.user.password
        };
        serviceDetails.inscrire(userDetails)
            .success (function(data) {
            if (data === "OK") {

                $location.path("/");
                $scope.error = false;
            } else {
                $location.path("/inscription");
                $scope.erreur=data;
                $scope.error = true;
            }
        })
            .error (function(res, req) {
            console.log('Repos error'+res+" - "+ req);
        });
    };

    $scope.reset=function(){
        $scope.user={nom:'',prenom:'',email:'',password:'',password_conf:''};
    };
}]);
// -------------

