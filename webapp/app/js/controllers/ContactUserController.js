/**
 * Created by hedhili on 18/06/2015.
 * ContactUserController
 */
var app = angular.module('readIt');
app.controller('ContactUserController', function($scope, $http){
    $scope.alertMessage = "";

    $scope.contact=function(){

        var userDetails= {
            mail : $scope.email,
            subject : $scope.subject_message,
            text : $scope.text_message
        };

        $http.post('/contact',userDetails)
            .success (function(data){

            $scope.modal = {
                "title": "Read-it",
                "content": "Votre message à bien été envoyé"
            };

            $scope.resetForm();
        })
            .error(function(data, status) {
                $scope.modal = {
                    "title": "Read-it - Erreur",
                    "content": data
                };
            });
    };

    $scope.resetForm = function(){
        $scope.subject_message = "";
        $scope.text_message = "";
        $scope.contactform = "";
    }

});
