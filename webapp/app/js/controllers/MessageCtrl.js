/**
 * Created by macbookpro on 07/07/15.
 */
var app = angular.module('readIt');
app.controller('messageCtrl',['$scope','$stateParams','auth',function($scope,$stateParams, auth) {

    $scope.username = $stateParams.username;
    $scope.messageMenu = [
        ['bold', 'italic', 'underline', 'strikethrough'],
        ['ordered-list', 'unordered-list', 'outdent', 'indent'],
        ['left-justify', 'center-justify', 'right-justify'],
        ['quote'],
        ['link']
    ];

    $scope.sendMessage = function(username, objet, message){
        console.log(username);
        var MessageBody = {
            usernameSender : auth.currentUser(),
            Username : username,
            Objet : objet,
            Message : message
        };
        auth.sendMessageto(MessageBody).success(function(data){
            console.log(data);
            if (data =="success") {
                $scope.message_return = "message envoyé";
                $scope.username="";
                $scope.objet ="";
                $scope.newMessage=" ";
            }

            else if(data =="echec") $scope.message_return = "l'utilisateur "+ MessageBody.Username +" n'a pas été trouvé, message non envoyé";
        });
    }
}]);

app.controller('messageListCtrl',['$scope','$state','auth',function($scope,$state, auth) {
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
    $scope.displayMessage = function(reciver, messageCorps)
    {
        messageCorps.reads = true;
        $scope.messageShow = messageCorps;

        auth.getCountMessageUnread(auth.currentUser()).success(function(data){
            $scope.numberMessage= data;
        });
        var messageObject =
        {
            id_message : messageCorps._id,
            reciver: reciver
        };

        auth.postReadMessage(messageObject).success(function(data){
            console.log(data);
        });


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
    }
}]);
