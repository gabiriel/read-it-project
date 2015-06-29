/**
 * Created by Gabi on 27/06/2015.
 */
var app = angular.module('readIt');
app.controller('AdminEventController', function($scope, auth, events){
    $scope.events = events.events;

    $scope.backgroundColors = ['blue', 'black', 'gray', 'green', 'brown', 'orange', 'pink', 'purple', 'red', 'white', 'yellow' ];
    $scope.textColors = ['blue', 'black', 'gray', 'green', 'brown', 'orange', 'pink', 'purple', 'red', 'white', 'yellow' ];

    $scope.validEvent = function(){
        var formEvent = $scope.selectedEvent;
        formEvent.title= $scope.titleEvent || $scope.selectedEvent.title;
        formEvent.description= $scope.descriptionEvent ||$scope.selectedEvent.description;
        formEvent.date= $scope.dateEvent|| $scope.selectedEvent.date;
        formEvent.url= $scope.url || $scope.selectedEvent.url;
        formEvent.textColor = $scope.textColor || $scope.selectedEvent.textColor;
        formEvent.color = $scope.color || $scope.selectedEvent.color;

        formEvent.display = true;
        events.update(formEvent);
    };

    $scope.deleteEvent = function(){
        var formEvent = $scope.selectedEvent;
        events.delete(formEvent);
        $scope.alertMessage = "Supprimé";
        $scope.selectedEvent = events[0];
    };

});
