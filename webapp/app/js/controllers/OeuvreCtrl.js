/**
 * Created by macbookpro on 19/06/15.
 */
var ReadIT = angular.module('readIt');

ReadIT.controller('OeuvreCtrl',['$scope','serviceDetails',function($scope,serviceDetails){

 serviceDetails.getListOeuvre("").success (function(data) {

     $scope.oeuvres = data;

 });
}]);
ReadIT.controller('OeuvreDetailCtrl',['$scope','serviceDetails','$stateParams','auth','commentaireService',function($scope, serviceDetails,$stateParams,auth,commentaireService){
    serviceDetails.getOeuvre($stateParams.id).success (function(data) {
        $scope.oeuvre = data[0];
    });

    $scope.comment= function(){
        var CommentDetails ={
            id : $stateParams.id,
            user : auth.currentUser(),
            commentaire : $scope.commentTxt

        };
        commentaireService.postComment(CommentDetails).success(function(data){
            console.log(data);

        });
        $scope.commentTxt="";
        $scope.Showcomments = 'true';
        $scope.addDiv(CommentDetails.user,CommentDetails.commentaire);

    };

    $scope.addDiv = function(user, comment){
        var newElemen = angular.element('#addDiv').append('<div style= "border: 1px solid #6FC2F4; padding: 15px;margin: 15px 0;"> '+user +': ' + comment +'</div>');
        $compile(newElemen)(scope);
    }
    $scope.displayComments = function(){
        var id_oeuvre=$stateParams.id;
        commentaireService.getComments(id_oeuvre).success(function(data){
           $scope.comments = data;
        });
    };

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
