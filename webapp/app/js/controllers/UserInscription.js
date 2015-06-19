var ReadIT = angular.module('readIt');
ReadIT.controller('NewUserController',['$scope','$http','$location',function($scope,$http,$location){
    $scope.save=function(){
        var userDetails= {
            firstName : $scope.user.nom,
            lastName : $scope.user.prenom,
            mail : $scope.user.email,
            password : $scope.user.password
        };
       if($scope.userForm.$valid){
           $http.post('/inscriptionuser',userDetails)
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
       }

       else
       alert("No");
    };

    $scope.reset=function(){
        $scope.user={nom:'',prenom:'',email:'',password:'',password_conf:''};
    };
}]);
// -------------

