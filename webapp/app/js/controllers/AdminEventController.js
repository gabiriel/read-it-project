/**
 * Created by Gabi on 27/06/2015.
 */
var app = angular.module('readIt');
app.controller('AdminEventController', function($scope, $filter, auth, events, serviceDetails){

    $scope.events = events.events;

    $scope.interface = "create";
    $scope.toggleView = function(){
        if($scope.interface == "create"){
            $scope.interface = "update";
        }else{
            $scope.interface = "create";
        }
    };

    $scope.colors = [
        { name: 'Bleu', value: '#6fc2f4' },
        { name: 'Noir', value: '#000'},
        { name: 'Gris', value: '#dfdfdf' },
        { name: 'Vert', value: '#e2f89c' },
        { name: 'Marron', value: '#ab774d' },
        { name: 'Orange', value: '#ff5a1e'},
        { name: 'Rose', value: '#ff1b5b' },
        { name: 'Violet', value: '#ab4a5b' },
        { name: 'Rouge', value: '#ff0f0f' },
        { name: 'Blanc', value: '#fefffe' },
        { name: 'Jaune', value: '#fcff70' }
    ];

    $scope.defaultColor = {
        text: { name: 'Blanc', value: '#fefffe' },
        background: { name: 'Bleu', value: '#6fc2f4' }
    };

    serviceDetails.getListOeuvre().success(function(oeuvres) {
        $scope.oeuvres = oeuvres;
    });

    /*
     * Actions
     **************************/
    $scope.createEvent = function(){

        var formEvent = $scope.createEventForm;
        $scope.selectedEvent = {};
        var txtColorValue, bkColorValue;
        if(formEvent.textColor != undefined)
            txtColorValue = formEvent.textColor.value || $scope.defaultColor.text.value;
        if(formEvent.backgroundColor != undefined)
            bkColorValue = formEvent.backgroundColor.value || $scope.defaultColor.background.value;

        // var calendarEvent = $scope.getFormEvent($scope.createEventForm);
        var calendarEvent = {
            author: formEvent.author || auth.currentUser(),
            title: formEvent.title || $scope.selectedEvent.title,
            description: formEvent.description ||$scope.selectedEvent.description || "",
            oeuvre_id: formEvent.oeuvre._id || $scope.selectedEvent.oeuvre_id,
            date: formEvent.date || $scope.selectedEvent.date,
            url: formEvent.url || $scope.selectedEvent.url,
            textColor: txtColorValue || $scope.selectedEvent.textColor,
            color: bkColorValue || $scope.selectedEvent.color,
            display: formEvent.display || false
        };

        events.create(calendarEvent);
        $scope.alertMessage = "Evenement (" + calendarEvent.title + ") créé";
        $scope.selectedEvent = null;
    };

    $scope.chooseEvent = function(event){
        $scope.selectedEvent = event;

        if ($scope.selectedEvent == null)
            return;

        if ($scope.selectedEvent.oeuvre_id != undefined)
            for (var i = 0; i < $scope.oeuvres.length; i++)
                if ($scope.oeuvres[i]._id == $scope.selectedEvent.oeuvre_id)
                    $scope.selectedEvent.oeuvre = $scope.oeuvres[i];

        if ($scope.selectedEvent.textColor != undefined)
            for (var i = 0; i < $scope.colors.length; i++)
                if ($scope.colors[i].value == $scope.selectedEvent.textColor)
                    $scope.selectedEvent.textColor = $scope.colors[i];

        if ($scope.selectedEvent.color != undefined)
            for (var i = 0; i < $scope.colors.length; i++)
                if ($scope.colors[i].value == $scope.selectedEvent.color)
                    $scope.selectedEvent.backgroundColor = $scope.colors[i];
    };

    $scope.updateSelectedEvent = function(){
        var calendarEvent = $scope.getFormEvent($scope.updateEventForm);
        events.update(calendarEvent)
            .error(function (err) {
                $scope.alertMessage=  {type:'info',text: 'Erreur'};
            })
            .success(function(){
                $state.go(
                    $state.current,
                    { alertMessage:{type:'info',text: 'Utilisateur modifié'} },
                    { reload: true }
                );
        });
        $scope.alertMessage = "Evenement (" + calendarEvent.title + ") sauvegardé";
        $scope.selectedEvent = null;
    };

    $scope.deleteEvent = function(event){
        var calendarEvent = event;
        events.delete(calendarEvent);
        $scope.alertMessage = "Evenement (" + calendarEvent.title + ") supprimé";
        $scope.selectedEvent = null;
    };

    $scope.getFormEvent = function(formEvent){

        var txtColorValue, bkColorValue, oeuvreId;
        if(formEvent.textColor != undefined)
            txtColorValue = formEvent.textColor.$modelValue || $scope.defaultColor.text.value;
        if(formEvent.backgroundColor != undefined)
            bkColorValue = formEvent.backgroundColor.$modelValue || $scope.defaultColor.background.value;
        if(formEvent.oeuvre != undefined)
            oeuvreId = formEvent.oeuvre.$modelValue._id;

        if(oeuvreId == undefined)
            oeuvreId = null;

        return {
            author: formEvent.author.$modelValue || auth.currentUser(),
            title: formEvent.title.$modelValue || $scope.selectedEvent.title,
            description: formEvent.description.$modelValue ||$scope.selectedEvent.description,
            oeuvre_id: oeuvreId ||$scope.selectedEvent.oeuvre_id,
            date: formEvent.date.$modelValue || $scope.selectedEvent.date,
            url: formEvent.url.$modelValue || $scope.selectedEvent.url,
            textColor: txtColorValue || $scope.selectedEvent.textColor,
            color: bkColorValue || $scope.selectedEvent.color,
            display: formEvent.display.$modelValue || false
        };
    };

    $scope.onchange = function(){
        $scope.resetForm();
    };

    $scope.resetForm = function(){
        $scope.selectedEvent = {};
        $scope.eventForm = {
            author:'', title: '',
            oeuvre: $scope.oeuvres[0]._id,
            date: '',
            description: '', url: '',
            textColor: '',
            backgroundColor: '',
            display: false
        };
    };

});
