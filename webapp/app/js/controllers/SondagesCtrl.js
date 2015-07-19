/**
 * Created by hedhili on 14/07/2015.
 */
var app = angular.module('readIt');

app.controller('SondagesCtrl', ['$scope', '$state', 'auth', function($scope, $state, auth){
    var Min_Choix = 2,
        Max_Choix = 5;

    auth.getAllSondages().success(function(sondages) {
        $scope.sondages = sondages;
    });

    var reponse = [ {name:'Réponse 1', rep:'' }, { name:'Réponse 2', rep:'' }];

    $scope.reponses = reponse;

    $scope.registerDetailSondage=function(detailSondageForm){
        auth.registerSondage(detailSondageForm,$scope.reponses)
            .error(function(err){
                $scope.error=err;
            })
            .then(function () {
                $scope.retrieveSondages();
                $state.go('home');

            })
    };

    $scope.addResponseToSondage = function () {
        var newItemNum = $scope.modifysondage.reponses.length+1;
        $scope.Modifyerror=false;
        if(newItemNum>Max_Choix)
            $scope.Modifyerror=({message:"Il faut que "+Max_Choix+" réponses"});
        else{
            $scope.modifysondage.reponses.push( {name: 'Réponse '+newItemNum, rep:''});
        }
    };

    $scope.removeResponseToSondage = function () {
        var lastItem = $scope.modifysondage.reponses.length-1;
        $scope.Modifyerror=false;
        if(lastItem>=Min_Choix){
            $scope.modifysondage.reponses.splice(lastItem);
        }else{
            $scope.Modifyerror = { message:"Vous ne pouvez pas avoir moins de "+ Min_Choix + " réponses possible" };
        }
    };

    $scope.addResponse= function () {
        var newItemNum = $scope.reponses.length+1;
        $scope.error=false;
        if(newItemNum>Max_Choix)
            $scope.error=({ message:"Vous ne pouvez pas avoir plus de "+Max_Choix+" réponses possible" });
        else
            $scope.reponses.push( {name: 'Réponse '+ newItemNum, rep:''});
    };

    $scope.removeResponse= function () {
        var lastItem = $scope.reponses.length-1;
        $scope.error=false;
        if(lastItem>=Min_Choix){
            $scope.reponses.splice(lastItem);
        }else
            $scope.error = { message:"Vous ne pouvez pas avoir moins de "+ Min_Choix + " réponses possible" };
    };

    $scope.retrieveSondages = function(){
        auth.getAllSondages().success(function(sondages){
                $scope.sondages = sondages;
            });
    };

    $scope.removeSondage = function(sondage){
        auth.deleteSondage(sondage)
            .success(function(){
                $scope.retrieveSondages();
                $state.go('home');
            });
    };

    $scope.detailsSondage= function (detailSondage) {
        $scope.Displaydetailsondage='modify';
        $scope.modifysondage=detailSondage;
    };

    $scope.modifyDetailsSondage=function(detailsondage){
        auth.modifySondage(detailsondage)
            .success(function(){
                $scope.retrieveSondages();
                $state.go('home');
            }).error(function (err) {
                $scope.Modifyerror=err;
            });
    };

}]);

app.controller('sondagesDetailsController',['$scope','auth','$stateParams','$state',function($scope,auth,$stateParams,$state) {
    var id=$stateParams.id;
    auth.getSondage(id)
        .success(function (data) {
            $scope.sondage=data;
        })
        .error(function (err) {
            $scope.erreur=err;
        });
    $scope.voteSondage= function (detailVote) {
        var vote =$scope.sondage.vote;
        console.log(detailVote);
        console.log(vote);

        auth.voteSondage(detailVote,vote)
            .success(function () {
                $state.go('home');
            })
            .error(function (err) {
                $scope.error=err;
            })
    };

}]);