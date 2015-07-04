/**
 * Created by macbookpro on 19/06/15.
 */
var ReadIT = angular.module('readIt');

ReadIT.controller('OeuvreCtrl',['$scope','serviceDetails',function($scope,serviceDetails){

 serviceDetails.getListOeuvre("").success (function(data) {

     $scope.oeuvres = data;

 });
}]);
ReadIT.controller('searchCtrl',['$scope','$stateParams','serviceDetails',function($scope,$stateParams,serviceDetails) {
    serviceDetails.getListOeuvre("").success (function(data) {
        console.log("data",data);
        $scope.Oeuvres = data;
        $scope.searchText = $stateParams.title;
    });
}]);
ReadIT.controller('OeuvreDetailCtrl',['$scope','serviceDetails','$stateParams','auth','commentaireService',function($scope, serviceDetails,$stateParams,auth,commentaireService){
    serviceDetails.getOeuvre($stateParams.id).success (function(data) {
        $scope.oeuvre = data;
        $scope.rating = $scope.oldRating = data.ratings.reduce(function(x,y) { return x + y.rating; },0) / data.ratings.length
                                            || 0;
    });
    serviceDetails.isFavorite(auth.currentUser(), $stateParams.id).success(function(data) {
        $scope.favorite = Boolean(data === 'true');
    });
    //$scope.oldRating = 0;
    //
    //$scope.rating = $scope.oldRating;

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
        $scope.addDiv(CommentDetails.user, CommentDetails.commentaire);

    };
    $scope.toogleFavorite = function() {
        $scope.favorite = ! $scope.favorite;
        if($scope.favorite) {
            serviceDetails.addFavorite(auth.currentUser(), $scope.oeuvre);
        } else {
            serviceDetails.removeFavorite(auth.currentUser(), $scope.oeuvre);
        }
    };
    //newRating is the new rate of the user, not the new average rate
    $scope.setRating = function(newRating) {
        $scope.rating = newRating;
    };
    //here, rating is how much the user rate the content
    $scope.saveRating = function() {
        //on enregistre
        serviceDetails.rate($scope.oeuvre._id, auth.currentUser(), $scope.rating)
            .success(function(data) {
                $scope.oldRating = data.rating;
                $scope.rating = data.rating;
            })
            .error(function(error) {
                alert('erreur lors de la notation' + error);
            });
        $scope.oldRating = $scope.rating;
    };
    $scope.reinitRating = function() {
        $scope.rating = $scope.oldRating;
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
ReadIT.controller('navBarCtrl',function($scope){
    $scope.mytxt ='';
    $scope.search = function(){
        var searchTxt = $scope.mytxt;
        document.location.href='/#/search/'+ searchTxt ;
    };
});
ReadIT.controller('popular-controller',['$scope','serviceDetails',function($scope,serviceDetails) {
    serviceDetails.getPopular()
        .success(function(data) {
            //alert(JSON.stringify(data));
            $scope.populars = data;
        })
        .error(function(data) {
            alert('erreur : ' + data);
        });
}]);
