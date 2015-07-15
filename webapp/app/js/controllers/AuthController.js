var app = angular.module('readIt');
app.controller('AuthController', ['$scope', '$state', 'auth', function($scope, $state, auth){
    setInterval(function(){

            if(auth.isLoggedIn())

                auth.getCountMessageUnread(auth.currentUser()).success(function(data){
                    $scope.numberMessage= data;

                });
        },
        1000 * 60 );
    setInterval(function(){
        if(auth.isLoggedIn())
        auth.getCountAddRequests(auth.currentUser()).success(function(data){
            $scope.numberAddRequests= data;
            console.log(data);
        });
}, 1000 * 30 );
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
            $state.go('home');
        })
    };



    if(auth.isLoggedIn())
        auth.getCountMessageUnread(auth.currentUser()).success(function(data){
        $scope.numberMessage= data;

    });
    if(auth.isLoggedIn())
        auth.getCountAddRequests(auth.currentUser()).success(function(data){
            $scope.numberAddRequests= data;
        });

}]);