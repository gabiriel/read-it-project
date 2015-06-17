var ReadIT = angular.module('readIt');
ReadIT.controller('NewUserController',['$scope','serviceDetails',function($scope,serviceDetails){
    $scope.save=function(){

            var userDetails= {
                  firstName : $scope.user.nom,
                  lastName : $scope.user.prenom,
                  mail : $scope.user.email,
                  password : $scope.user.password
            };
            serviceDetails.newUser(userDetails).success(function(data){
                    if(data=='succes') alert('user saved');
                else alert("non Valide");
            });
            $scope.reset();



    };
    $scope.reset=function(){
        $scope.user={nom:'',prenom:'',email:'',password:'',password_conf:''};
    }
}]);
// -------------

