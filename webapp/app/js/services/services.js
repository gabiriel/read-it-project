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

    Details.getListOeuvre = function () {
        return $http.get("/oeuvres");
    };

    Details.getOeuvre = function (id_oeuvre) {
        return $http.get("/oeuvre", {
            params: {id_Oeuvre: id_oeuvre}
        });
    };

    Details.addFavorite = function(params) {
        return $http.post("/user/favorites/add", {
            idOeuvre: params.oeuvre._id,
            idUser: params.user_id
        });
    };
    Details.removeFavorite = function(params) {
        return $http.post("/user/favorites/remove", {
            idOeuvre: params.oeuvre._id,
            idUser: params.user_id
        });
    };
    Details.isFavorite = function(user_id, oeuvre_id) {
        return $http.get("/user/favorites/is", {
            params: {
                idOeuvre: oeuvre_id,
                idUser: user_id
            }
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

    Details.readChapter = function(user,idOeuvre,idChapter) {
        return $http.post('/oeuvre/read', {
            user:user,
            idOeuvre: idOeuvre,
            idChapter: idChapter
        });
    };
    Details.unreadChapter = function(user,idOeuvre,idChapter) {
        return $http.post('/oeuvre/unread', {
            user:user,
            idOeuvre: idOeuvre,
            idChapter: idChapter
        });
    };
    Details.getReadChapter = function(user,idOeuvre,idChapter) {
        return $http.get('/oeuvre/get/read',{
            params : {
                user:user,
                idOeuvre: idOeuvre,
                idChapter: idChapter
            }
        });
    };

    Details.saveOeuvre = function(oeuvre,image) {
        var fd = new FormData();
        fd.append('image', image);
        for(var i in oeuvre.chapters) {
            if(oeuvre.chapters[i].cover) {
                fd.append('image-' + i, oeuvre.chapters[i].cover);
                oeuvre.chapters[i].cover = undefined;
            }
        }

        fd.append('oeuvre', JSON.stringify(oeuvre));
        return $http.post('/oeuvre/create', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        });
    };
    Details.saveChapterRating = function(oeuvreId, chapterId, rating,userId) {
        return $http.post("/oeuvre/rate/chapter",{
            oeuvreId: oeuvreId,
            chapterId: chapterId,
            rating: rating,
            user: userId
        })
    };

    Details.readAll = function(user, idOeuvre) {
        return $http.post('/oeuvre/read/all', {
            user:user,
            idOeuvre: idOeuvre
        });
    };
    Details.updateOeuvre = function(oeuvre,cover) {
        var fd = new FormData();
        if(cover)
            fd.append('image', cover);

        for(var i in oeuvre.newChapters) {
            alert(oeuvre.newChapters[i].cover);
            if(oeuvre.newChapters[i].cover) {
                fd.append('image-' + i, oeuvre.newChapters[i].cover);
                oeuvre.newChapters[i].cover = undefined;
            }
        }

        fd.append('oeuvre',JSON.stringify(oeuvre));
        return $http.post('/oeuvre/update', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        });
    };
    Details.removeOeuvre = function(idOeuvre) {
        return $http.post('/oeuvre/remove', {
            idOeuvre:idOeuvre
        });
    };

    Details.getUser = function(currentUser){
        return $http.get("/User", {
            params: {currentUser: currentUser}
        });
    };

    Details.getFriends = function(username){
        return $http.get('/friends',{
            params : {username : username}
        });
    };
    Details.getInterested = function(oeuvreId, userId) {
        return $http.get('/user/interested',{
            params : {
                oeuvreId : oeuvreId,
                userId : userId
            }
        });
    };

    Details.interested = function(oeuvreId, userId) {
        return $http.post('/user/add/interested',{
            oeuvreId : oeuvreId,
            userId : userId
        });
    };
    Details.notInterested = function(oeuvreId, userId) {
        return $http.post('/user/remove/interested',{
            oeuvreId : oeuvreId,
            userId : userId
        });
    };

    return Details;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
    var auth = {};

    auth.saveToken = function (token){
        $window.localStorage['read-it-token'] = token;
    };

    auth.getToken = function () {
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

    auth.currentUserId = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload._id;
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


    auth.searchUsers = function(searched) {
        return $http.get('/users/search',{
            params: { searched: searched }
        });
    };
    auth.getAllUser = function(currentUser){
        return $http.get('/Users',{
            params: {currentUser: currentUser}
        });
    };
    auth.deleteUser = function(deleteUser) {
        if(auth.isAdmin()){
            return $http.get('/usersDelete', {
                params: {deleteUser: deleteUser}
            });
        }
    };

    auth.sendMessageto = function(message){
        return $http.post('/messages',message);
    };

    auth.getMessage = function(userName){
        return $http.get('/messagesSend',{
            params : {username :  userName}
        })
    };
    auth.getCountMessageUnread = function(userName){
        return $http.get('/messagesUnread',{
            params : {username :  userName}
        })
    };
    auth.postReadMessage= function(message){
        return $http.post('/messageRead',message);
    };
    auth.removeMessage= function(id_message){
        return $http.post('/message/remove',id_message);
    };
    auth.modifyUser=function(user){
        if(auth.isAdmin()){
            return $http.post('/modifyUser',user);
        }
    };
    /**
     * Les sondages
     */
    auth.registerSondage= function (sondage,responses) {
        var reponses=[];
        angular.forEach(responses, function (reponse) {
            reponses.push({name:reponse.name,rep:reponse.rep})
        });
        var questionRep=({question:sondage.question,reponses:reponses});
        return $http.post('/sondage/create',questionRep);

    };
    auth.getAllSondages= function () {
        return $http.get('/Sondages');
    };
    auth.deleteSondage = function(id,idsondage) {

        var _id={_id:idsondage,_idquestion:id};
        return $http.post('/sondage/delete',_id);
    };
    auth.modifySondage= function (detail,id) {
        var reponses=[];
        angular.forEach(detail.reponses, function (reponse) {
            reponses.push({name:reponse.name,rep:reponse.rep})
        });
        var questionRep=({_id:id,_idQuestion:detail._id,question:detail.question,reponses:reponses});
        return $http.post("/sondage/modify",questionRep)
    };
    auth.activeSondage = function (idQ,idS) {
        var req=({_id:idS,_idQ:idQ});
        return $http.post("/sondage/active",req);

    }
    auth.getSondage = function (user) {

        var user={user:user};
        return $http.post("/sondage",user);
    };
    auth.voteSondage=function (detailVote,vote,res){
        angular.forEach(detailVote.reponses, function (reponse) {
            if(reponse._id==vote) reponse.Numvote++;
        });
        var keepGoing=true;
        var isExist=false;

        if(detailVote.users!=null){
            angular.forEach(detailVote.users, function (user) {
                if(!(keepGoing && user!=auth.currentUser())){
                    console.log("user:");
                    console.log(user);
                    keepGoing=false;
                    isExist=true;
                }

            });
        }
        if(isExist){
            return ({message: 'Vous avez déjà voté : ' + err}).end();
        }else{
            detailVote.users=[];
            detailVote.users.push(auth.currentUser());
            var details={detail:detailVote};

            return $http.post('/sondage/vote',details);
        }

    };

    auth.getUsersFriends = function(username){
        return $http.get('/user/friends',{
            params : {username : username}
        });
    };
    auth.postAddFriends = function(info){
        return $http.post('/user/friends/add',info);
    };
    auth.getAddRequest = function(username){
        return $http.get('/user/friends/requests',{
            params : {username : username}
        });
    };
    auth.getCountAddRequests = function(username,$rootScope){
        return $http.get('/user/friends/requests/count',{
            params : {username : username}
        });
    };
    auth.postRequestFriends = function(username){
        return $http.post('/user/friends/requestAdd',username);
    };
    auth.postRemoveRequestFriends = function(info){
        return $http.post('/user/friends/requestRemove',info);
    };
    auth.alreadyFriends = function(user,userFriends){
        return $http.get('/user/friends/already',{
            params :{user : user, userFriends : userFriends}
        })
    };
    auth.removeFriends = function(username,usernameFriends){
        var infoFriends ={
            user : username,
            friendsName : usernameFriends
        }
        return $http.post('/user/friends/remove',infoFriends);
    };
    auth.existeUser = function(username,currentUser){
        return $http.get('/user/exist'
            ,{
                params:{username : username,currentUser:currentUser}
            });
    };
    auth.changePicture = function(userId,picture) {
        var fd = new FormData();
        fd.append('picture', picture);
        fd.append('userId', userId);
        return $http.post('/user/picture/change', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        });
    };
    auth.getActivity = function(userName) {
        return $http.get('/user/activity',{
            params:{userName:userName}
        })
    };
    auth.blockUser = function(username, usernameBlock){
        var info ={
            username: username,
            usernameBlock : usernameBlock
        };
        return $http.post('/user/block',info);
    };
    auth.unblockUser = function(username, usernameBlock){
        var info ={
            username: username,
            usernameBlock : usernameBlock
        };
        return $http.post('/user/unblock',info);
    };
    auth.isBlock = function(username, usernameBlock){
        return $http.get('/user/isBlock',{
            params :
            {
                username :username,
                usernameBlock: usernameBlock
            }
        });
    };
    auth.listOeuvreIntersted = function(username){
        return $http.get('/user/list/intersted',{
            params:
            {
                username : username
            }
        });
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

    o.getDisplayed = function(){
        return $http.get('/events/displayed').success(function(data){
            angular.copy(data, o.events);
        });
    };

    o.create = function(event) {
        return $http.post('/event/create', event, {
            headers: {Authorization: 'Bearer '+ auth.getToken()}
        }).success(function(data){
            o.getAll();
        });
    };

    o.update = function(event) {
        return $http.post('/event/update', event, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function(data){
            o.getAll();
        });
    };

    o.delete = function(event) {
        return $http.post('/event/delete', event, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function(data){
            o.getAll();
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

    };

    return commentDetails;
}]);