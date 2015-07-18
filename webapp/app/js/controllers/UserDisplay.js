var readIt = angular.module('readIt');
readIt.controller('UserPage',['$scope', '$stateParams', 'auth', function($scope, $stateParams, auth){
    var user = $stateParams.user;
    $scope.imgSource ="img.jpg";//donnée le lien vers limage de profile de chaque utilisateur
    $scope.auth = auth;

    auth.getUser(user).success(function(data){
        $scope.user = data;
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
                    $scope.return_add_friends_valide ="valide";
                    $scope.return_add_friends_erreur="false";
                    $scope.message_return = "cette utilisateur ne fait plus parti de votre liste d'ami";
                    $scope.add='addFriends';
                    $scope.remove='false';
                }
                else {
                    $scope.return_add_friends_valide ="false";
                    $scope.return_add_friends_erreur="erreur";
                    $scope.message_return_error = "une erreur est servenu au moment de la suppression";
                }
            }
        );
    };
    $scope.changePicture = function(files) {
        //alert("test");
        //alert(files);
        auth.changePicture(auth.currentUserId(),files[0])
            .success(function(data) {
                $scope.user.picture = data;
            })
            .error(function() {

            });
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
                    $scope.return_add_friends_valide ="valide";
                    $scope.return_add_friends_erreur="false";
                    $scope.message_return = "demande d'ami envoyé";
                    $scope.add='false';
                }
                else {
                    $scope.add='false';
                    $scope.return_add_friends_valide ="false";
                    $scope.return_add_friends_erreur="erreur";
                    $scope.message_return_error = "Demande d'ami déja envoyé";
                }
            }
        )
    };

}]);

readIt.controller('addRequestsCtrl',['$scope', 'auth', function($scope, auth) {
    var username = auth.currentUser();
    if(auth.isLoggedIn()) {
        auth.getAddRequest(username).success(function (user) {
            $scope.requests = user;
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