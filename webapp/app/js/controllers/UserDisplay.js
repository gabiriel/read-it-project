var readIt = angular.module('readIt');
readIt.controller('UserPage',['$scope', '$stateParams', 'auth', function($scope, $stateParams, auth){
    var user = $stateParams.user;

    $scope.imgSource ="img.jpg";//donnée le lien vers limage de profile de chaque utilisateur
    $scope.auth = auth;

    auth.getUser(user).success(function(data){
        $scope.userName = data.username;
        if($scope.userName == auth.currentUser())
        {
            $scope.add='false';
            $scope.remove='false';
            $scope.bloc = 'false';
            $scope.message='false';
        }
        else{
            $scope.add='addFriends';
            $scope.bloc = 'blocUser';
            $scope.message='sendMessage';
        }

        auth.getFriends($scope.userName).success(function(friends){
            $scope.friends = friends;
        });

        auth.alreadyFriends(auth.currentUser(),$scope.userName)
            .success
        (
            function(data)
            {
                console.log(data);
                if(data == "success"){
                    $scope.add='false';
                    $scope.remove='removeFriends';
                }
            }
        );
    });

    $scope.removeFromFriend=function(){
        var info ={
            user : auth.currentUser(),
            friendsName : $scope.userName
        };
        auth.removeFriends(info)
            .success(function(data)
            {
                if(data =="success")
                {
                    alert("ami suprimmé");
                    $scope.add='addFriends';
                    $scope.remove='false';
                }
            }
        );
    };

    $scope.addFriend = function(){

        auth.existeUser(auth.currentUser(),$scope.userName)
            .success(function(data)
            {
                if(data=="false"){
                    var friends ={
                        friendsUsername : $scope.userName,
                        Username : auth.currentUser()
                    };
                    auth.postRequestFriends(friends);
                    alert('Demande envoyée');
                    $scope.add='false';
                }
                else alert("Demande déja envoyée");
            }
        )
    };

}]);

readIt.controller('addRequestsCtrl',['$scope', 'auth', function($scope, auth) {
    var username = auth.currentUser();
    if(auth.isLoggedIn()) {
        auth.getAddRequest(username).success(function (user) {
            $scope.requests = user;
            console.log(user);
        });
        $scope.valideRequest = function (user, userToAdd) {
            var infoUser = {
                user: user,
                userToAdd: userToAdd
            };
            auth.existeUser(infoUser.user,infoUser.userToAdd).success(function(data) {
                if (data = "false")
                {
                    auth.postAddFriends(infoUser);
                    auth.getAddRequest(username).success(function (user) {
                        $scope.requests = user;
                        console.log(user);
                    });
                }
                else alert("demande déja envoyé");
            });


        };

        $scope.removeRequest = function (user, userToAdd) {
            var infoUser = {
                user: user,
                userToAdd: userToAdd
            };
            auth.postRemoveRequestFriends(infoUser);
            auth.getAddRequest(username).success(function (user) {
                $scope.requests = user;
            });
            auth.getCountAddRequests(auth.currentUser()).success(function (data) {
                $scope.numberAddRequests = data;
            });
        };
        auth.getAddRequest(username).success(function (user) {
            $scope.requests = user;

        });
    }

}]);