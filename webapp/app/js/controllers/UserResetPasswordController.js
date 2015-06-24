/**
 * Created by hedhili on 22/06/2015.
 */
var app = angular.module('readIt');
app.controller('UserResetPasswordController',['$scope','$location','serviceDetails',function($scope,$location,$serviceDetails){
    $scope.resetpassword=function(){
        var userDetails= {
            password : $scope.user.password,
            token:$location.search().token
        };

        $serviceDetails.reset(userDetails)
            .success (function(data){
            if (data === "OK") {

                $location.path("/");
                $scope.error = false;
            } else {
                alert(data);
                /*
                $location.path("/user/reset/:token");
                $scope.erreur=data;
                $scope.error = true;
                */
            }
        })
            .error(function(data, status) {
                alert('Repos error'+status+' - '+data);
            });
    }
    $scope.reset=function(){
        $scope={email:''};
    }

}]);
