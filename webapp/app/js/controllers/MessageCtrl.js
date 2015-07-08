/**
 * Created by macbookpro on 07/07/15.
 */
var ReadIt = angular.module('readIt');
ReadIt.controller('messageCtrl',['$scope','auth',function($scope, auth) {

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
        auth.sendMessageto(MessageBody).success(function(data){
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
ReadIt.controller('messageListCtrl',['$scope','auth',function($scope, auth) {

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
    $scope.displayMessage = function(reciver,messageCorps)
    {
        $scope.sender = messageCorps.sender;
        $scope.objet = messageCorps.objet;
        messageCorps.reads = true;
        $scope.message = messageCorps.message;
        $scope.messageShow ='true';
        var messageObject =
        {
            id_message : messageCorps._id,
            reciver: reciver
        };

        auth.postReadMessage(messageObject).success(function(data){
         console.log(data);
        });

    }
}]);
