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
    var fields = [{name:'Réponse 1', val:''}];
    //va contenir toutes les valeurs de notre formulaire
    $scope.formData = {};
    $scope.formData.dynamicFields = fields;
    
    $scope.registerSondage=function(){
        alert("à faire");
    };
    $scope.addField= function () {
        var newItemNum = $scope.formData.dynamicFields.length+1;
        $scope.formData.dynamicFields.push( {name: 'Réponse '+newItemNum, val: ''});
    }
}]);