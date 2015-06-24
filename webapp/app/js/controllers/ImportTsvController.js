/**
 * Created by arjuna on 17/06/15.
 */

var app = angular.module('readIt');
app.controller('ImportTsvController',['$scope','serviceDetails',function($scope,serviceDetails){
    $scope.send = function() {
        var file = $scope.fichier;
        serviceDetails.importCsv(file,"to-import")
            .error(function(data) {
                alert("erreur lors de l'import")
            });
    };
}]);