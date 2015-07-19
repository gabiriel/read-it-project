/**
 * Created by arjuna on 17/06/15.
 */

var app = angular.module('readIt');
app.controller('ImportTsvController',['$scope', '$state', 'serviceDetails',function($scope, $state, serviceDetails){
    $scope.send = function() {
        var file = $scope.fichier;
        serviceDetails.importCsv(file,"to-import")
            .success(function(data) {
                if(data === 'failure') {
                    alert("Echec lors de l'import");
                    return;
                }
                $state.go("/");
            })
            .error(function(data) {
                alert("Erreur lors de l'import")
            });
    };
}]);