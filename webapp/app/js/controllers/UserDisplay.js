var app = angular.module('readIt');
app.controller('UserDisplay',['$scope', '$state', '$stateParams','serviceDetails', 'auth', function($scope, $state, $stateParams, serviceDetails, auth){
    var user = $stateParams.user;
    $scope.imgSource ="default_user.png";

    serviceDetails.getUser(user).success(function(data) {
        if(data==null)
            $state.go('search', {title: $stateParams.user});

        $scope.user = data;
        $scope.userName = data.username;
        if($scope.user.picture == undefined) // display default user img
            $scope.user.picture = $scope.imgSource;

        $scope.isCurrentUserPage = false;
        if(auth.isLoggedIn() && (auth.currentUserId() == $scope.user._id) ){
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
                    console.log(data);
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
            console.dir(data.ratings);
            $scope.activities = data.reads
                        .concat(data.friends)
                        .concat(data.comments)
                        .concat(data.ratings);
                                //.sort(function(e1,e2) {
                                //    return e2.date - e1.date;
                                //});
        });
    $scope.removeFromFriend=function(){
        var info ={
            user : auth.currentUser(),
            friendsName : $scope.userName
        };

        auth.removeFriends(info)
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
    $scope.block = function(username){

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
    };

}]);

app.controller('addRequestsCtrl', ['$scope', '$rootScope', 'auth', function($scope,$rootScope, auth) {

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
                else console.log("déja ami");
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