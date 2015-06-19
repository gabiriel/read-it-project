/**
 * Created by macbookpro on 13/06/15.
 */
var app = angular.module('readIt');
app.factory('serviceDetails', ['$http',function($http){
    var Details = {};
    Details.newUser = function(userDetail){
        return $http.post("/",userDetail);
    };
    Details.importCsv = function(file,fileName) {
        var fd = new FormData();
        fd.append(fileName, file);
        return $http.post("/import", fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        });
    };
    Details.inscrire = function (userDetail){
        return $http.post("/inscriptionuser",userDetail);
    }
    Details.login = function (userDetail) {
        return $http.post("/connexion", userDetail);
    }

    return Details;
}]);