/**
 * Created by macbookpro on 19/06/15.
 */
var ReadIT = angular.module('readIt');
ReadIT.controller('OeuvreCtrl',['$scope','serviceDetails',function($scope,serviceDetails){

 serviceDetails.getListOeuvre("").success (function(data) {

     $scope.oeuvres = data;

 });
}]);
ReadIT.controller('OeuvreDetailCtrl',['$scope','serviceDetails','$stateParams',function($scope, serviceDetails,$stateParams){
    //$scope.name = $stateParams.name;
    serviceDetails.getOeuvre($stateParams.id).success (function(data) {
        $scope.type = data[0].type;
        $scope.name = data[0].name;
        $scope.chapters = data[0].chapters;
        $scope.authors = data[0].author;
        $scope.categories = data[0].category;


        console.log();
    });
}]);
