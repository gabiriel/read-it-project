/**
 * Created by Gabi on 24/06/2015.
 */
var app = angular.module('readIt');
app.controller('UiCalendarController', function($scope, $compile, uiCalendarConfig, $datepicker, events) {
    /**
     * Create calendar with mongoDB elements
     **************************/
    $scope.eventSources = [events.events];

    /**
     * Form values
     */
    $scope.dateEvent = moment().add(1,'days');
    $scope.titleEvent = 'Titre';


    /**
     * Calendar UI EVENTS
     ***************************************/
    $scope.renderCalendar = function(calendar) {
        if(uiCalendarConfig.calendars[calendar]){
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };

    $scope.eventRender = function( event, element, view ) {
        element.attr({'tooltip': event.title,
            'tooltip-append-to-body': true});
        $compile(element)($scope);
    };

    $scope.alertOnEventClick = function(date, jsEvent){
        $scope.$apply(function () {
            $scope.eventClicked = date;
        });
    };

    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
        $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };

    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
        $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    $scope.addRemoveEventSource = function(sources,source) {
        var canAdd = 0;
        angular.forEach(sources,function(value, key){
            if(sources[key] === source){
                sources.splice(key,1);
                canAdd = 1;
            }
        });
        if(canAdd === 0){
            sources.push(source);
        }
    };

    $scope.uiConfig = {
        calendars:{
            lang: 'fr',
            justForAdminCalendar:{
                editable: true,
                header:{
                    left: 'title',
                    center: '',
                    right: 'prev,today,next'
                },
                eventClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize,
                eventRender: $scope.eventRender
            },
            displayCalendar:{
                lang: 'fr',
                editable: false,
                header:{
                    left: 'title',
                    center: '',
                    right: 'prev,today,next'
                },
                eventClick: $scope.alertOnEventClick
            }
        }
    };

    /**
     * Create event in database
     */
    $scope.addEvent = function(){
        if(!$scope.titleEvent || $scope.titleEvent === '' || !$scope.dateEvent) { return; }
        events.create({
            title: $scope.titleEvent,
            description: $scope.descriptionEvent,
            date: $scope.dateEvent,
            dateCreation: new Date()
        });
        $scope.titleEvent = '';
        $scope.descriptionEvent = '';
        $scope.alertMessage = "Evenement sauvegardé";
    };

});