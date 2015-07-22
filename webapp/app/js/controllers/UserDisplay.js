var app = angular.module('readIt');
app.controller('UserDisplay',['$scope','$rootScope', '$state', '$stateParams','serviceDetails', 'auth', function($scope,$rootScope, $state, $stateParams, serviceDetails, auth){
    auth.listOeuvreIntersted(auth.currentUserId()).success(function(data){
        $scope.OeuvresIntersted = data;
    });
    if(auth.isLoggedIn()){
        auth.getCountMessageUnread(auth.currentUser()).success(function(nbUnreadMsg){
            $rootScope.numberMessage = nbUnreadMsg;
        });
        auth.getCountAddRequests(auth.currentUser()).success(function(nbFriendRequests){
            $rootScope.numberAddRequests = nbFriendRequests;
        });
    }
    var user = $stateParams.user;
    $scope.imgSource ="default_user.png";

    serviceDetails.getUser(user).success(function(data) {
        if(data==null)
            $state.go('search', {title: $stateParams.user});

        if(!$scope.isCurrentUserPage)
        {
            $scope.isBlock(data.username);
        }
        $scope.user = data;
        $scope.userName = data.username;
        if($scope.user.picture == undefined) // display default user img
            $scope.user.picture = $scope.imgSource;

        $scope.isCurrentUserPage = false;

        if(auth.isLoggedIn() && (auth.currentUserId() == $scope.user._id) ) {
            $scope.isCurrentUserPage = true;
        }

        if($scope.isCurrentUserPage)
        {
            $scope.add ='false';
            $scope.remove ='false';
            $scope.bloc = 'false';
            $scope.message = 'false';

        }
        else
        {
            $scope.add ='addFriends';
            $scope.bloc = 'blocUser';
            $scope.message='sendMessage';
        }

        serviceDetails.getFriends($scope.userName).success(function(friends){
            $scope.friends = friends;

        });

        if(auth.isLoggedIn()){
            auth.alreadyFriends(auth.currentUser(), $scope.userName)
                .success(function (data) {
                    if (data == "success") {
                        $scope.add = 'false';
                        $scope.remove = 'removeFriends';
                    }
                }
            );
        }


    });

    auth.getActivity(user)
        .success(function(data) {
            $scope.activities = data.reads
                        .concat(data.friends)
                        .concat(data.comments)
                        .concat(data.ratings);
        });
    $scope.removeFromFriend=function(username,usernameFriends){
        var info ={
            user : auth.currentUser(),
            friendsName : $scope.userName
        };

        auth.removeFriends(username,usernameFriends)
            .success(function(data) {
                if(data =="success")
                {
                    $scope.return_add_friends_valide ="valide";
                    $scope.return_add_friends_erreur="false";
                    $scope.message_return = "Cet utilisateur a été retiré de votre liste d'ami";
                    $scope.add='addFriends';
                    $scope.remove='false';
                }
                else {
                    $scope.return_add_friends_valide ="false";
                    $scope.return_add_friends_erreur="erreur";
                    $scope.message_return_error = "Une erreur est survenue lors de la suppression";
                }
            }
        );
        auth.getFriends($scope.userName).success(function(friends){
            $scope.friends = friends;
        });
    };
    $scope.block = function(username, usernameBlock){
        auth.blockUser(username,usernameBlock).success(function(data){

            auth.isBlock(auth.currentUser(), usernameBlock).success(function (dataa) {
                if (dataa != "false") {
                    $scope.add = 'false';
                    $scope.remove = 'false';
                    $scope.bloc = 'false';
                    $scope.message = 'false';
                    $scope.isBlocked = true;
                    if (dataa == "i_am_in_his_list")
                        $scope.message_Block = "Vous ne pouvez pas contacter cet utilisateur";
                    else {
                        $scope.message_Block = "Cet utilisateur est bloqué";
                        $scope.unbloc ='unblocUser';
                    }

                }
            });
            $scope.friends = auth.getUsersFriends(username);
        });
    };

    $scope.isBlock = function(username) {
        auth.isBlock(auth.currentUser(), username).success(function (data) {
            if (data != "false") {
                $scope.add = 'false';
                $scope.remove = 'false';
                $scope.bloc = 'false';
                $scope.message = 'false';
                $scope.isBlocked = true;
                if (data == "i_am_in_his_list")
                    $scope.message_Block = "Vous ne pouvez pas contacter cet utilisateur";
                else {
                    $scope.message_Block = "Cet utilisateur est bloqué";
                    $scope.unbloc ='unblocUser';
                }

            }
        });
    };

    $scope.unblock = function(username, usernameBlock){
        auth.unblockUser(username,usernameBlock).success(function(data){
            auth.isBlock(auth.currentUser(), username).success(function (data) {
                if (data == "false") {
                    $scope.add ='addFriends';
                    $scope.bloc = 'blocUser';
                    $scope.message='sendMessage';
                    $scope.unbloc ='false';

                    $scope.isBlocked= false;

                }
            });
        });
    };
    $scope.changePicture = function(files) {
        auth.changePicture(auth.currentUserId(),files[0])
            .success(function(data) {
                $scope.user.picture = data;
            })
            .error(function() {

            });
    };

    $scope.addFriend = function(){
        auth.isBlock($scope.userName,auth.currentUser()).success(function(data){
            if(data=="false"){
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
                            $scope.message_return = "Demande d'ami envoyée";
                            $scope.add='false';
                        }
                        else {
                            $scope.add='false';
                            $scope.return_add_friends_valide ="false";
                            $scope.return_add_friends_erreur="erreur";
                            $scope.message_return_error = "Demande d'ami déja envoyée";
                        }
                    }
                )
            }
            else {
                $scope.return_add_friends_valide ="false";
                $scope.return_add_friends_erreur="erreur";
                $scope.message_return_error = "ustilsateur bloqué";
            }

        });

    };

}]);

app.controller('addRequestsCtrl', ['$scope', '$rootScope', 'auth', function($scope,$rootScope, auth) {
    if(auth.isLoggedIn()){
        auth.getCountMessageUnread(auth.currentUser()).success(function(nbUnreadMsg){
            $rootScope.numberMessage = nbUnreadMsg;
        });
        auth.getCountAddRequests(auth.currentUser()).success(function(nbFriendRequests){
            $rootScope.numberAddRequests = nbFriendRequests;
        });
    }
    var username = auth.currentUser();
    if(auth.isLoggedIn()) {
        auth.getAddRequest(username).success(function (addRequests) {
            $scope.requests = addRequests;
        });
        $scope.valideRequest = function (user, userToAdd) {
            var infoUser = {
                user: user,
                userToAdd: userToAdd
            };

            auth.existeUser(infoUser.user,infoUser.userToAdd).success(function(data) {
                if (data != "false")
                {
                    auth.postAddFriends(infoUser);
                    
                    auth.getAddRequest(username).success(function (addRequests) {
                        $scope.requests = addRequests;
                    });

                    auth.getCountAddRequests(auth.currentUser()).success(function (data) {
                        console.log("count add request " + data);
                        $rootScope.numberAddRequests = data;
                    });

                }
                else {
                    $scope.return_add_friends_valide ="false";
                    $scope.return_add_friends_erreur="erreur";
                    $scope.message_return_error = "utilisateur déja ami";
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
                $rootScope.numberAddRequests = data;
            });
        };

        auth.getAddRequest(username).success(function (user) {
            $scope.requests = user;

        });
    }

}]);