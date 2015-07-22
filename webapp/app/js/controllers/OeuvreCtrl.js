var app = angular.module('readIt');
app.controller('OeuvreCtrl',['$scope','$rootScope','auth','serviceDetails',function($scope,$rootScope,auth, serviceDetails){

    if(auth.isLoggedIn()){
        auth.getCountMessageUnread(auth.currentUser()).success(function(nbUnreadMsg){
            $rootScope.numberMessage = nbUnreadMsg;
        });
        auth.getCountAddRequests(auth.currentUser()).success(function(nbFriendRequests){
            $rootScope.numberAddRequests = nbFriendRequests;
        });
    }
    serviceDetails.getListOeuvre().success(function(oeuvres) {
        $scope.oeuvres = oeuvres;
    });
    $scope.remove = function(oeuvre) {
        if(!confirm('Êtes vous sûr de vouloir supprimer cette oeuvre ?'))
            return;

        serviceDetails.removeOeuvre(oeuvre._id)
            .success(function(data) {
                $scope.oeuvres.splice($scope.oeuvres.indexOf(oeuvre),1);
            })
            .error(function(err) {
                alert("Une erreur est survenue lors de la suppresion de l'Oeuvre : " +err);
            });
    };
}]);

app.controller('OeuvreDetailCtrl',['$scope','serviceDetails', '$state','$stateParams','auth','commentaireService',function($scope, serviceDetails, $state, $stateParams,auth,commentaireService){

    $scope.ratings = [];

    serviceDetails.getOeuvre($stateParams.id).success(function(data) {
        $scope.oeuvre = data;

        if($scope.oeuvre.cover == undefined)
            $scope.oeuvre.cover = "default_cover.png";

        $scope.rating = $scope.oldRating = data.ratings.reduce(function(x,y) { return x + y.rating; },0) / data.ratings.length
                                            || 0;
        for(var i in data.chapters) {
            $scope.oeuvre.chapters[i].rating = data.chapters[i].ratings.reduce(function(c,n) {
                return c + n.rating;
            }, 0);
        }
        $scope.ratings = $scope.oeuvre.chapters.map(function(chapter) {
            return chapter.rating;
        });
        if(auth.isLoggedIn()) {
            serviceDetails.getReadChapter(auth.currentUser(),$stateParams.id)
                .success(function(data) {
                    for(var i in $scope.oeuvre.chapters) {
                        $scope.oeuvre.chapters[i].read = data.some(function(x) {
                            return $scope.oeuvre.chapters[i]._id == x;
                        });
                    }
                });
            serviceDetails.getInterested($scope.oeuvre._id,auth.currentUserId())
                .success(function(data) {
                    $scope.oeuvre.interested = data.result;
                })
                .error(function(err) {
                })
        }
    });

    $scope.notFinished = function() {
        return $scope.oeuvre && $scope.oeuvre.chapters.some(function(elem) {
            return !elem.read;
        });
    };
    $scope.notReadAndInterested = function() {
        return $scope.oeuvre && $scope.oeuvre.chapters.every(function(elem) {
                return !elem.read;
            }) && $scope.oeuvre.interested;
    };
    $scope.notReadAndNotInterested = function() {
        return $scope.oeuvre && $scope.oeuvre.chapters.every(function(elem) {
                return !elem.read;
            }) && !$scope.oeuvre.interested;
    };
    $scope.finir = function() {
        serviceDetails.readAll(auth.currentUserId(), $scope.oeuvre._id)
            .success(function() {
                for(var i in $scope.oeuvre.chapters)
                    $scope.oeuvre.chapters[i].read = true;
            })
            .error(function(data) {
                alert("Une erreur est survenue lors de l'enregistrement de la lecture");
            });
    };

    $scope.interested = function() {
        serviceDetails.interested($scope.oeuvre._id,auth.currentUserId())
            .success(function() {
                $scope.oeuvre.interested = true;
            })
            .error(function(err) {
            })
    };
    $scope.notInterested = function() {
        serviceDetails.notInterested($scope.oeuvre._id,auth.currentUserId())
            .success(function() {
                $scope.oeuvre.interested = false;
            })
            .error(function(err) {
            })

    };

    $scope.readAll = function() {
        serviceDetails.readAll($scope.user, $scope.oeuvre._id);
    };
    serviceDetails.isFavorite(auth.currentUserId(), $stateParams.id).success(function(data) {
        $scope.favorite = Boolean(data === 'true');
    });

    $scope.toggleRead = function(chapter) {
        $scope.result = 'toogle';
        chapter.read = !chapter.read;
        if(chapter.read)
            serviceDetails.readChapter(auth.currentUser(), $scope.oeuvre._id, chapter._id,chapter.read);
        else
            serviceDetails.unreadChapter(auth.currentUser(), $scope.oeuvre._id, chapter._id,chapter.read);
    };
    /*enter,leave,clickBegin, and clickEnd are used in the read selector*/
    $scope.enter= function(chapter) {
        if($scope.clicking) {
            $scope.toggleRead(chapter);
        }
    };
    $scope.leave = function() {
        $scope.clicking = false;
    };
    $scope.clickBegin = function(chapter) {
        $scope.clicking = true;
        $scope.toggleRead(chapter);
    };
    $scope.clickEnd = function() {
        $scope.clicking = false;
    };
    $scope.comment= function(){
        if(!auth.isLoggedIn()) {
            $state.go('login');
            return;
        }

        var CommentDetails ={
            id : $stateParams.id,
            user : auth.currentUser(),
            commentaire : $scope.newComment,
            date : new Date()

        };
        commentaireService.postComment(CommentDetails).success(function(data){
            console.log(data);

        });
        $scope.newComment="";
        $scope.Showcomments = 'true';
        $scope.comments.push(CommentDetails);
    };
    $scope.commentMenu = [
        ['bold', 'italic', 'underline', 'strikethrough'],
        ['ordered-list', 'unordered-list', 'outdent', 'indent'],
        ['left-justify', 'center-justify', 'right-justify'],
        ['quote'],
        ['link']
    ];
    $scope.comments = [];
    $scope.toggleFavorite = function() {
        $scope.favorite = !$scope.favorite;

        var params = {
            user_id: auth.currentUserId(),
            oeuvre: $scope.oeuvre
        };
        if($scope.favorite) {
            serviceDetails.addFavorite(params);
        } else {
            serviceDetails.removeFavorite(params);
        }
    };
    $scope.saveChapterRating = function(index) {
        if(!$scope.oeuvre.chapters[index].read) {
            $('#connectedToRateError').modal('show');
            $scope.reinitChapterRating(index);
            return;
        }
        $scope.oeuvre.chapters[index].rating = $scope.ratings[index];
        serviceDetails.saveChapterRating($scope.oeuvre._id,$scope.oeuvre.chapters[index]._id,$scope.ratings[index],auth.currentUser())
            .success(function(data) {
                console.log(data);
                $scope.oeuvre.chapters[index].rating = parseInt(data);
            })
            .error(function(err) {
                alert("Une erreur est survenue lors de l'enregistrement de la note");
            });
    };
    //newRating is the new rate of the user, not the new average rate
    $scope.setRating = function(newRating) {
        $scope.rating = newRating;
    };
    $scope.reinitChapterRating = function(index) {
        $scope.ratings[index] = $scope.oeuvre.chapters[index].rating || 0;
    };
    //here, rating is how much the user rate the content
    $scope.saveRating = function() {
        if(!$scope.oeuvre.chapters.some(function(item) {return item.read})) {
            $('#connectedToRateError').modal('show');
            //alert('vous devez avoir commencer a lire l\'oeuvre pour la noter');
            $scope.reinitRating();
            return;
        }
        //on enregistre
        serviceDetails.rate($scope.oeuvre._id, auth.currentUser(), $scope.rating)
            .success(function(data) {
                $scope.oldRating = data.rating;
                $scope.rating = data.rating;
            })
            .error(function(error) {
                alert('Erreur lors de la notation' + error);
            });
        $scope.oldRating = $scope.rating;
    };
    $scope.reinitRating = function() {
        $scope.rating = $scope.oldRating;
    };

    $scope.displayComments = function(){
        var id_oeuvre=$stateParams.id;
        commentaireService.getComments(id_oeuvre).success(function(data){
            $scope.comments = data
                .map(function(elem){
                return {
                    _id: elem._id,
                    user :elem.user ,
                    id_oeuvre : elem.id_oeuvre ,
                    commentaire : elem.commentaire,
                    date : new Date(elem.date)
                }
            });
        });
    };

}]);

app.controller('popular-controller',['$scope','serviceDetails',function($scope,serviceDetails) {
    serviceDetails.getPopular()
        .success(function(data) {
            $scope.populars = data;
        })
        .error(function(data) {
            alert('erreur : ' + data);
        });
}]);
app.controller('wellRated-controller',['$scope','serviceDetails',function($scope,serviceDetails) {
    serviceDetails.getWellRated()
        .success(function(data) {
            $scope.wellRated = data;
        })
        .error(function(data) {
            alert('erreur : ' + data);
        });
}]);

app.controller('add-oeuvre-controller',['$scope','serviceDetails',function($scope, serviceDetails) {
    $scope.newComment = {};
    $scope.chapters = [];
    $scope.categories = [];
    $scope.authors = [];

    $scope.addAuthor =function() {
        if($scope.newAuthor == '') return;
        $scope.authors.push({name: $scope.newAuthor});
        $scope.newAuthor = '';
        $("#txt-author").focus();
    };

    $scope.addCategory = function() {
        if($scope.newCategory == '') return;
        $scope.categories.push({name: $scope.newCategory});
        $scope.newCategory = '';
        $("#txt-category").focus();
    };

    $scope.addChapter = function() {
        $scope.chapters.push($scope.newChapter);
        $scope.newChapter = {};
        $("#txt-chapter-name").focus();
    };

    $scope.commentMenu = [
        ['bold', 'italic', 'underline', 'strikethrough'],
        ['ordered-list', 'unordered-list', 'outdent', 'indent'],
        ['left-justify', 'center-justify', 'right-justify'],
        ['quote'],
        ['link']
    ];

    $scope.save = function() {
        if (!confirm('Êtes vous sûr de vouloir sauvegarder ' + $scope.name + ' ?'))
            return;
        $scope.newNumber = Math.floor($scope.newNumber) + 1;
        alert($scope.cover);
        serviceDetails.saveOeuvre({
                name: $scope.name,
                chapters: $scope.chapters,
                type: $scope.type,
                category: $scope.categories
                                .map(function(elem) {
                                    return elem.name;
                                }),
                author: $scope.authors
                                .map(function(elem) {
                                    return elem.name;
                                })
            },$scope.cover)
            .success(function(data) {
                $scope.name = '';
                $scope.type= '';
                $scope.chapters= [];
                $scope.categories = [];
                $scope.authors = [];
            })
            .error(function(err) {
                alert('Une erreur est survenue lors de la sauvegarde');
            });
    };
}]);

app.controller('update-oeuvre-controller',['$scope','$stateParams','serviceDetails',function($scope, $stateParams, serviceDetails) {
    $scope.newComment = {};
    $scope.chapters = [];
    $scope.categories = [];
    $scope.authors = [];
    $scope.removedChapters = [];
    $scope.newChapter = {isNew:true};
    serviceDetails.getOeuvre($stateParams.id)
        .success(function(data) {
            $scope.chapters = data.chapters;
            $scope.name = data.name;
            $scope.categories = data.category.map(function(elem) {
                return {name: elem}
            });
            $scope.authors = data.author.map(function(elem) {
                return {name: elem}
            });
        })
        .error(function(data) {
            alert(data);
        });
    $scope.addAuthor =function() {
        if($scope.newAuthor == '') return;
        $scope.authors.push({name: $scope.newAuthor});
        $scope.newAuthor = '';
        $("#txt-author").focus();
    };
    $scope.addCategory = function() {
        if($scope.newCategory == '') return;
        $scope.categories.push({name: $scope.newCategory});
        $scope.newCategory = '';
        $("#txt-category").focus();
    };
    $scope.addChapter = function() {
        $scope.chapters.push($scope.newChapter);
        $scope.newChapter = {isNew:true};
        $("#txt-chapter-name").focus();
    };
    $scope.removeChapter = function(chapter) {
        var index = $scope.chapters.indexOf(chapter);
        $scope.removedChapters.push(chapter);
        $scope.chapters.splice(index, 1);
    };
    $scope.commentMenu = [
        ['bold', 'italic', 'underline', 'strikethrough'],
        ['ordered-list', 'unordered-list', 'outdent', 'indent'],
        ['left-justify', 'center-justify', 'right-justify'],
        ['quote'],
        ['link']
    ];
    $scope.save = function() {
        if (!confirm('Êtes vous sûr de vouloir sauvegarder ' + $scope.name + ' ?'))
            return;
        $scope.newNumber = Math.floor($scope.newNumber) + 1;
        serviceDetails
            .updateOeuvre({
                _id:$stateParams.id,
                name: $scope.name,
                //chapters: $scope.chapters,
                type: $scope.type,
                category: $scope.categories
                    .map(function(elem) {
                        return elem.name;
                    }),
                author: $scope.authors
                    .map(function(elem) {
                        return elem.name;
                    }),
                newChapters: $scope.chapters
                    .filter(function(e) {
                        return e.isNew;
                    }),
                removedChapters: $scope.removedChapters
            })
            .success(function(data) {
            })
            .error(function(err) {
                alert('Une erreur est survenue lors de la sauvegarde');
            });
    };
}]);
