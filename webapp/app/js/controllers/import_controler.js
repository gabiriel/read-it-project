/**
 * Created by arjuna on 17/06/15.
 */

var module = angular.module('readIt');
module.controller('import',['$scope','serviceDetails',function($scope,serviceDetails){
    $scope.send = function() {
        var file = $scope.fichier;
        serviceDetails.importCsv(file,"to-import")
            .error(function(data) {
                alert("erreur lors de l'import")
            });
    }
}]);