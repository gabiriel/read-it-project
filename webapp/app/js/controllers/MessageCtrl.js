/**
 * Created by macbookpro on 07/07/15.
 */
var app = angular.module('readIt');
app.controller('messageCtrl',['$scope','$rootScope','$stateParams','auth',function($scope,$rootScope, $stateParams, auth) {
    $scope.username = $stateParams.username;
    $scope.messageMenu = [
        ['bold', 'italic', 'underline', 'strikethrough'],
        ['ordered-list', 'unordered-list', 'outdent', 'indent'],
        ['left-justify', 'center-justify', 'right-justify'],
        ['quote'],
        ['link']
    ];

    $scope.sendMessage = function(username, objet, message){
        var MessageBody = {
            usernameSender : auth.currentUser(),
            Username : username,
            Objet : objet,
            Message : message
        };
        auth.alreadyFriends(MessageBody.Username, MessageBody.usernameSender).success(function(data){
            if(data=="success") {
                auth.sendMessageto(MessageBody).success(function (send) {
                    if (send == "success") {
                        $scope.message_return_valide = "valide";
                        $scope.message_return_erreur = "false";
                        $scope.message_return = "message envoyé ";
                        $scope.objet = "";
                        $scope.newMessage = " ";

                    }



                });
            }
            else if(data=="echec"){
                $scope.message_return_valide = "false";
                $scope.message_return_erreur = "erreur";
                $scope.message_return_error = MessageBody.Username + " ne fait pas partie de votre liste d'amis, vous ne pouvez pas lui envoyer de message.";
            }
            else{
                $scope.message_return_valide = "false";
                $scope.message_return_erreur = "erreur";
                $scope.message_return_error = MessageBody.Username + " n'a pas été trouvé, le message ne peut être envoyé.";
            }
        });
    }
}]);

app.controller('messageListCtrl',['$scope','$rootScope','$state','auth',function($scope,$rootScope,$state, auth) {
    auth.getMessage(auth.currentUser()).success(function(data) {
        $scope.messages= data
            .map(function(elem){
                return {
                    _id: elem._id,
                    sender :elem.sender ,
                    objet : elem.objet ,
                    message : elem.message ,
                    reads : elem.reads,
                    date : new Date(elem.date)
                }
            })
            .sort(function(elem1,elem2){
                return elem2.date - elem1.date;

            });
        console.log($scope.messages);
    });
    auth.getCountMessageUnread(auth.currentUser()).success(function(data) {
        console.log(data);
    });
    $scope.displayMessage = function(reciver, messageCorps)
    {
        messageCorps.reads = true;
        $scope.messageShow = messageCorps;

        var messageObject = {
            id_message : messageCorps._id,
            reciver: reciver
        };

        auth.postReadMessage(messageObject).success(function(data){});
        var messageReadsCount=0;
        for(var i in $scope.messages) {
            if(!$scope.messages[i].reads) ++messageReadsCount;
        }
        console.log($rootScope.numberMessage);
        console.log(messageReadsCount);
        $rootScope.numberMessage = messageReadsCount;
    };

    $scope.answer = function(user){
        $scope.user = $scope.sender;
    };

    $scope.removeMessage = function(username,id_message){
        var infoMessage ={
            username : username,
            id_message : id_message
        };
        $scope.messageShow = null;
        auth.removeMessage(infoMessage);
        auth.getMessage(auth.currentUser()).success(function(data) {
            $scope.messages= data
                .map(function(elem){
                    return {
                        _id: elem._id,
                        sender :elem.sender,
                        objet : elem.objet,
                        message : elem.message ,
                        reads : elem.reads,
                        date : new Date(elem.date)
                    }
                })
                .sort(function(elem1,elem2){
                    return elem2.date - elem1.date;

                });
            console.log($scope.messages);
        });
    }
}]);
