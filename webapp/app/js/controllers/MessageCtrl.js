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
                $scope.newMessage="";
            }

            else if(data =="echec") $scope.message_return = "l'utilisateur "+ MessageBody.Username +" n'a pas été trouvé, message non envoyé";
        });
    }

}]);
ReadIt.controller('messageListCtrl',['$scope','auth',function($scope, auth) {

    auth.getMessage(auth.currentUser()).success(function(data) {
        console.log(data);
        $scope.messages= data.sort(function(elem1,elem2){
        console.log(typeof(elem2.date));
            return new Date(elem2.date) - new Date(elem1.date);

        });

    });
    $scope.displayMessage = function(sender,objet,message)
    {
        $scope.sender = sender;
        $scope.objet = objet;
        $scope.message = message;
    }
}]);
