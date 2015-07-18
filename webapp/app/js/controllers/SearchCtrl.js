/**
 * Created by Gabi on 18/07/2015.
 */
var app = angular.module('readIt');

app.controller('navBarCtrl',function($scope){
    $scope.mytxt ='';
    $scope.search = function(){
        var searchTxt = $scope.mytxt;
        document.location.href='/#/search/'+ searchTxt ;
        $scope.mytxt = "";
    };
});

app.controller('SearchCtrl', function($scope,$stateParams, auth, serviceDetails) {
    serviceDetails.getListOeuvre().success(function(oeuvres) {
        $scope.oeuvres = oeuvres;
        $scope.searchText = $stateParams.title;
    });

    auth.searchUsers($stateParams.title)
        .success(function(data) {
            $scope.users = data;
        })
        .error(function(err) {
            alert(err);
        });
});