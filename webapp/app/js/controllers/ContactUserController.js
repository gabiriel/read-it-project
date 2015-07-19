/**
 * Created by hedhili on 18/06/2015.
 * ContactUserController
 */
var app = angular.module('readIt');
app.controller('ContactUserController',function($scope,$http,$location){
    $scope.contact=function(){
        var userDetails= {
            mail : $scope.email,
            subject : $scope.subject_message,
            text : $scope.text_message
        };

        $http.post('/contact',userDetails)
            .success (function(data){
            if (data === "OK") {

                $location.path("/");
                $scope.error = false;
            } else {
                $location.path("/contact");
                $scope.erreur=data;
                $scope.error = true;
            }
        })
            .error(function(data, status) {
                alert('Repos error'+status+' - '+data);
            });
    };

    $scope.reset=function(){
        $scope.user={email:'',password:''};
    }

});
