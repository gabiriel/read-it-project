/**
 * Created by macbookpro on 13/06/15.
 */
angular.module('readIt').factory('serviceDetails', ['$http',function($http){
    var Details = {};
    Details.newUser = function(userDetail){
        return $http.post("/",userDetail);
    };
    return Details;
}]);