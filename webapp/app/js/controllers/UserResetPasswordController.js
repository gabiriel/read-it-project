/**
 * Created by hedhili on 22/06/2015.
 */
var app = angular.module('readIt');
app.controller('UserResetPasswordController',['$scope','$location','serviceDetails','$state',function($scope,$location,$serviceDetails,$state){
    $scope.resetpassword=function(){
        var userDetails= {
            password : $scope.user.password,
            token:$location.search().token
        };

        $serviceDetails.reset(userDetails)
            .success (function(data){
            $state.go('home');
        })
            .error(function(err) {
                $scope.error=err;
            });
    };

}]);
