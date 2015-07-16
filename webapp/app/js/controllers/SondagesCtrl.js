/**
 * Created by hedhili on 14/07/2015.
 */
var app = angular.module('readIt');

app.controller('SondagesCtrl',['$scope', '$state', 'auth', function($scope, $state, auth){
    //nous commençons avec un champ hobby dans notre forumaire
    var Max_Choix=5;
    var Min_Choix=2;

    var reponse = [{name:'Réponse 1',rep:''},{name:'Réponse 2',rep:''}];
    //va contenir toutes les valeurs de notre formulaire
    $scope.reponses = {};
    $scope.reponses = reponse;

    $scope.registerDetailSondage=function(detailSondageForm){
        auth.registerSondage(detailSondageForm,$scope.reponses)
            .error(function(err){
                $scope.error=err;
            })
            .then(function () {
                auth.getAllSondages()
                    .success(function(data){
                        $scope.sondages = data;

                    });

            })
    };
    $scope.addResponseToSondage = function () {
        var newItemNum = $scope.modifysondage.reponses.length+1;
        $scope.Modifyerror=false;
        if(newItemNum>Max_Choix)
            $scope.Modifyerror=({message:"Il faut que "+Max_Choix+" réponses"});
        else{
            $scope.modifysondage.reponses.push( {name: 'Réponse '+newItemNum,rep:''});

        }
    };
    $scope.removeResponseToSondage = function () {
        var lastItem = $scope.modifysondage.reponses.length-1;
        $scope.Modifyerror=false;
        if(lastItem>=Min_Choix){
            $scope.modifysondage.reponses.splice(lastItem);
        }else{
            $scope.Modifyerror=({message:"Il faut au moins "+Min_Choix+" réponses"});

        }
    };

    $scope.addResponse= function () {
        var newItemNum = $scope.reponses.length+1;
        $scope.error=false;
        if(newItemNum>Max_Choix)
            $scope.error=({message:"Il faut que "+Max_Choix+" réponses"});
        else
            $scope.reponses.push( {name: 'Réponse '+newItemNum,rep:''});

    };
    $scope.removeResponse= function () {
        var lastItem = $scope.reponses.length-1;
        $scope.error=false;
        if(lastItem>=Min_Choix){
            $scope.reponses.splice(lastItem);
        }else
            $scope.error=({message:"Il faut au moins "+Min_Choix+" réponses"});
    };
    auth.getAllSondages()
        .success(function(data){
            $scope.sondages = data;
        });

    $scope.removeSondage = function(sondage){
        auth.deleteSondage(sondage)
            .success(function(){
                auth.getAllSondages()
                    .success(function(data){
                        $scope.sondages = data;
                    });
            });
    };
    $scope.detailsSondage= function (detailSondage) {

        $scope.Displaydetailsondage='modify';
        $scope.modifysondage=detailSondage;
    };
    $scope.modifyDetailsSondage=function(detailsondage){
        auth.modifySondage(detailsondage)
            .success(function(){
                auth.getAllSondages()
                    .success(function(data){
                        $scope.sondages = data;
                    });
            }).error(function (err) {
                $scope.Modifyerror=err;
            })
    };

}]);

app.controller('sondages-controller',['$scope','auth',function($scope,auth) {
    auth.getAllSondages()
        .success(function(data) {
            $scope.sondages = data;
        })
        .error(function(data) {
            alert('erreur : ' + data);
        });
}]);

app.controller('sondagesDetailsController',['$scope','auth','$stateParams',function($scope,auth,$stateParams) {
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
        auth.voteSondage(detailVote,vote);
    };


}]);

///---------------------------------
//nous commençons avec un champ hobby dans notre forumaire
/*
var Max_Choix=5;
var Min_Choix=2;

var reponse = [{name:'Réponse 1',rep:''},{name:'Réponse 2',rep:''}];
//va contenir toutes les valeurs de notre formulaire
$scope.reponses = {};
$scope.reponses = reponse;

$scope.registerDetailSondage=function(detailSondageForm){
    auth.registerSondage(detailSondageForm,$scope.reponses)
        .error(function(err){
            $scope.error=err;
        })
        .then(function () {
            auth.getAllSondages()
                .success(function(data){
                    $scope.sondages = data;

                });

        })
};
$scope.addResponse= function () {
    var newItemNum = $scope.reponses.length+1;
    if(newItemNum>Max_Choix)
        $scope.error=({message:"Il faut que "+Max_Choix+" réponses"});
    else
        $scope.reponses.push( {name: 'Réponse '+newItemNum,rep:'', val: ''});
};
$scope.removeResponse= function () {
    var lastItem = $scope.reponses.length-1;
    if(lastItem>=Min_Choix){
        $scope.reponses.splice(lastItem);
    }else
        $scope.error=({message:"Il faut au moins "+Min_Choix+" réponses"});
};
auth.getAllSondages()
    .success(function(data){
        $scope.sondages = data;
    });

$scope.removeSondage = function(sondage){
    auth.deleteSondage(sondage)
        .success(function(){
            auth.getAllSondages()
                .success(function(data){
                    $scope.sondages = data;
                });
        });
};*/
///--------------------------------