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
               .success (function(res){
               alert(res);

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

