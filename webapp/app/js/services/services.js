/**
 * Created by macbookpro on 13/06/15.
 */
var app = angular.module('readIt');
app.factory('serviceDetails', ['$http',function($http){
    var Details = {};
    Details.importCsv = function(file,fileName) {
        var fd = new FormData();
        fd.append(fileName, file);
        return $http.post("/import", fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        });
    };

    Details.forgot = function (userDetail) {
        return $http.post("/forgotpassword", userDetail);
    };
    
    Details.reset = function (userDetail) {
        return $http.post("/user/reset/", userDetail);
    };
    Details.getListOeuvre = function (titleOeuvre) {
        return $http.get("/oeuvres", {
            params: {Oeuvre: titleOeuvre}
        });
    }
    Details.getOeuvre = function (id_oeuvre) {
        return $http.get("/oeuvre", {
            params: {id_Oeuvre: id_oeuvre}
        });
    }
    //je passe l'utilisateur en parametre, mais c'est une faille de sécurité(on ne vérifie pas qu'on peut retirer)
    //il faudrai de préférence le trouver au niveau de la session
    //j'ai cru comprendre que la session n'est pas encore au point, et c'est déja comme ça qu'on fait pour les commentaires
    Details.addFavorite = function(user, oeuvre) {
        return $http.post("/user/favorites/add", {
            idOeuvre: oeuvre._id,
            user: user
        });
    };
    Details.removeFavorite = function(user, oeuvre) {
        return $http.post("/user/favorites/remove", {
                idOeuvre: oeuvre._id,
                user: user
        });
    };
    Details.isFavorite = function(user, idOeuvre) {
        return $http.post("/user/favorites/is", {
            idOeuvre: idOeuvre,
            user: user
        });
    };

    Details.getPopular = function() {
        return $http.get("/oeuvres/popular");
    };

    Details.rate =function(idOeuvre,user,rating) {
        return $http.post("/oeuvre/rate",{
            idOeuvre:idOeuvre,
            user: user,
            rating:rating
        });
    };

    Details.getRating = function(idOeuvre) {
        return $http.get("/oeuvre/rating", {
            params: { idOeuvre: idOeuvre }
        });
    };
    Details.getWellRated = function() {
        return $http.get('/oeuvre/well_rated');
    };

    return Details;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
    var auth = {};

    auth.saveToken = function (token){
        $window.localStorage['read-it-token'] = token;
    };

    auth.getToken = function (){
        return $window.localStorage['read-it-token'];
    };

    auth.isLoggedIn = function(){
        var token = auth.getToken();
        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    auth.isAdmin = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.roles["admin"];
        }
    };

    auth.currentUser = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.username;
        }
    };

    auth.register = function(user){
        return $http.post('/register', user);
    };

    auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    };

    auth.logOut = function(){
        $window.localStorage.removeItem('read-it-token');
    };

    return auth;
}]);

/** Calendar Events Factory **/
app.factory('events', ['$http', 'auth', function($http, auth){
    var o = {
        events: [ ]
    };

    o.getAll = function() {
        return $http.get('/events').success(function(data){
            angular.copy(data, o.events);
        });
    };

    o.getNews = function(){
      return $http.get('/events/new').success(function(data){
         angular.copy(data, o.events);
      });
    };

    o.create = function(event) {
        return $http.post('/event/create', event, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.getAll();
        });
    };

    o.update = function(event) {
        return $http.post('/event/update', event, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.getNews();
        });
    };

    o.delete = function(event) {
        return $http.post('/event/delete', event, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.getNews();
        });
    };

    return o;
}]);
app.factory('commentaireService',['$http',function($http){
    var commentDetails ={};
    commentDetails.postComment = function(details){
        return $http.post('/commentaire',details);
    };
    commentDetails.getComments = function(id_oeuvre){
        return $http.get("/comments", {
            params: {id_Oeuvre: id_oeuvre}
        });

    }

    return commentDetails;
}]);