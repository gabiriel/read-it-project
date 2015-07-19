var app = angular.module('readIt');
app.controller('AuthController', ['$scope','$rootScope', '$state', 'auth', function($scope,$rootScope, $state, auth){
    setInterval(function(){
            if(auth.isLoggedIn()){
                auth.getCountMessageUnread(auth.currentUser()).success(function(nbUnreadMsg){
                       $rootScope.numberMessage = nbUnreadMsg;
                });
                auth.getCountAddRequests(auth.currentUser()).success(function(nbFriendRequests){
                        $rootScope.numberAddRequests = nbFriendRequests;
                });
            }
        },
        1000 * 120 ); // every 2 minutes

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
            $scope.Users = data;
        });

    $scope.detailsUser=function(detailuser){
        $scope.Displaydetailsuser="modify";
        $scope.modifyuser=detailuser;

    };

    $scope.modifyDetailsUser=function(detailuser){
        auth.modifyUser(detailuser)
            .error(function (err) {
                $scope.Modifyerror=err;
            }).success(function(){
                $state.go($state.current, {Modifyerror: 'Utilisateur modifié'}, {reload: true});
            })
    };
    
    if(auth.isLoggedIn()){
        auth.getCountMessageUnread(auth.currentUser()).success(function(data){
            $rootScope.numberMessage= data;
        });

        auth.getCountAddRequests(auth.currentUser()).success(function(data){
                $rootScope.numberAddRequests= data;
        });
    }

}]);
