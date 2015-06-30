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
    serviceDetails.getOeuvre($stateParams.id).success (function(data) {
        $scope.oeuvre = data[0];
    });
}]);
ReadIT.controller('searchCtrl',['$scope','$stateParams','serviceDetails',function($scope,$stateParams,serviceDetails) {
    serviceDetails.getListOeuvre("").success (function(data) {
        console.log("data",data);
        $scope.Oeuvres = data;
        $scope.searchText = $stateParams.title;
    });
}]);
ReadIT.controller('navBarCtrl',function($scope){
    $scope.mytxt ='';
    $scope.search = function(){
        var searchTxt = $scope.mytxt;
        document.location.href='/#/search/'+ searchTxt ;
    };
});
