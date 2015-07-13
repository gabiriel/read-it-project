var app = angular.module('readIt');
app.controller('AuthController', ['$scope', '$state', 'auth', function($scope, $state, auth){
    setInterval(function(){

            if(auth.isLoggedIn())

                auth.getCountMessageUnread(auth.currentUser()).success(function(data){
                    $scope.numberMessage= data;

                });
        },
        1000 * 60 );

    $scope.user = {};
    $scope.auth = auth;

    $scope.register = function(){
        auth.register($scope.user).error(function(error){
            $scope.error = error;
        }).then(function(){
            $state.go('home');
        });
    };

    $scope.logIn = function(){
        auth.logIn($scope.user).error(function(error){
            $scope.error = error;
        }).then(function(){
            $state.go('home');
        });
    };

    $scope.reset = function(){
        $scope.user.clear();
    };
   $scope.removeUser = function(name){
       auth.deleteUser(name).success(function(data){
           auth.getAllUser(auth.currentUser())
               .success(function(data){
                   console.log(data);
                   $scope.Users = data;
               });
       });

   };
    auth.getAllUser(auth.currentUser())
        .success(function(data){
            console.log(data);
            $scope.Users = data;
        });

    $scope.detailsUser=function(detailuser){
        $scope.Diplaydetailsuser="modify";
        $scope.modifyuser=detailuser;

    };

    $scope.modifyDetailsUser=function(detailuser){
       auth.modifyUser(detailuser)
            .error(function (err) {
            $scope.Modifyerror=err;
        }).success(function(){
            $state.go('home');
        })
    };


    //nous commençons avec un champ hobby dans notre forumaire
    var Max_Choix=5;
    var Min_Choix=2;

    var reponse = [{name:'Réponse 1',rep:''},{name:'Réponse 2',rep:''}];
    //va contenir toutes les valeurs de notre formulaire
    $scope.reponses = {};
    $scope.reponses = reponse;
    
    $scope.registerDetailSondage=function(detailSondageForm){
        console.log("authcontrole:"+detailSondageForm.question);
        console.log($scope.reponses);
        auth.registerSondage(detailSondageForm,$scope.reponses).error(function(err){
            $scope.error=err;
        }).success(function () {
            $state.go("/sondage/create")
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

}]);