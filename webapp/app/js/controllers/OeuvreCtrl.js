var ReadIT = angular.module('readIt');
ReadIT.controller('OeuvreCtrl',['$scope','serviceDetails',function($scope, serviceDetails){

    serviceDetails.getListOeuvre().success(function(oeuvres) {
        $scope.oeuvres = oeuvres;
    });
    $scope.remove = function(oeuvre) {
        if(!confirm('etes vous sur de vouloires supprimer cette oeuvre ?'))
            return;

        serviceDetails.removeOeuvre(oeuvre._id)
            .success(function(data) {
                $scope.oeuvres.splice($scope.oeuvres.indexOf(oeuvre),1);
            })
            .error(function(err) {
                alert('une erreur est survenue lors de la suppresion de l\'ouevre : ' +err);
            });
    };
     $scope.oeuvres = data;

}]);

ReadIT.controller('OeuvreDetailCtrl',['$scope','serviceDetails', '$state','$stateParams','auth','commentaireService',function($scope, serviceDetails, $state, $stateParams,auth,commentaireService){
    $scope.logged = auth.isLoggedIn();
    $scope.ratings = [];
    $scope.notFinished = function() {
        return $scope.oeuvre.chapters.every(function(elem) {
            return !elem.read;
        });
    };
    $scope.notReadOrInterested = function() {
        return $scope.oeuvre.chapters.every(function(elem) {
            return !elem.read;
        });
    };
    $scope.finir = function() {
        serviceDetails.readAll(auth.currentUserId(), $scope.oeuvre._id)
            .success(function() {
                for(var i in $scope.oeuvre.chapters)
                    $scope.oeuvre.chapters[i].read = true;
            })
            .error(function(data) {
                alert('une erreure est survenue lors de l\'engeristrement de la lecure');
            });
    };
    serviceDetails.getOeuvre($stateParams.id).success (function(data) {
        $scope.oeuvre = data;
        $scope.rating = $scope.oldRating = data.ratings.reduce(function(x,y) { return x + y.rating; },0) / data.ratings.length
                                            || 0;
        $scope.ratings = data.chapters.map(function(chapter) {
            return chapter.ratings.reduce(function(c,n) {
                return c + n.rating;
            }, 0);
        });
        if($scope.logged) {
            serviceDetails.getReadChapter(auth.currentUser(),$stateParams.id).success(function(data) {
                for(var i in $scope.oeuvre.chapters) {
                    $scope.oeuvre.chapters[i].read = data.some(function(x) {
                        return $scope.oeuvre.chapters[i]._id == x;
                    });
                }
                var reading = $scope.oeuvre.chapters.some(function(elem) {
                    return elem.read;
                });
                var finished = $scope.oeuvre.chapters.every(function(elem) {
                    return elem.read;
                });
                var interested = false;
                //$scope.readingState = finished
                //                ? 'finished'
                //                : reading
                //                    ? 'reading'
                //                    : interested
                //                        ? 'interested'
                //                        : 'not interested'
            });
        }
    });
    $scope.readAll = function() {
        serviceDetails.readAll($scope.user, $scope.oeuvre._id);
    };
    serviceDetails.isFavorite(auth.currentUserId(), $stateParams.id).success(function(data) {
        $scope.favorite = Boolean(data === 'true');
    });

    //$scope.oldRating = 0;
    //
    //$scope.rating = $scope.oldRating;
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
        if(! $scope.logged) {
            $state.go('login');
            return;
        }

        var CommentDetails ={
            id : $stateParams.id,
            user : auth.currentUser(),
            commentaire : $scope.newComment

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
            alert('vous devez avoir lu un chapitre pour pouvoir la noter');
            $scope.reinitChapterRating(index);
            return;
        }
        $scope.oeuvre.chapters[index].rating = $scope.ratings[index];
        serviceDetails.saveChapterRating($scope.oeuvre._id,$scope.oeuvre.chapters[index]._id,$scope.ratings[index],auth.currentUserId())
            .success(function(data) {
                console.log(data);
                $scope.oeuvre.chapters[index].rating = parseInt(data);
            })
            .error(function(err) {
                alert('une erreur est survenue lors de l\'enregistrement de la note');
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
            alert('vous devez avoir commencer a lire l\'oeuvre pour la noter');
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
                alert('erreur lors de la notation' + error);
            });
        $scope.oldRating = $scope.rating;
    };
    $scope.reinitRating = function() {
        $scope.rating = $scope.oldRating;
    };

    $scope.displayComments = function(){
        var id_oeuvre=$stateParams.id;
        commentaireService.getComments(id_oeuvre).success(function(data){
            $scope.comments = data;
        });
    };

}]);

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
ReadIT.controller('wellRated-controller',['$scope','serviceDetails',function($scope,serviceDetails) {
    serviceDetails.getWellRated()
        .success(function(data) {
            //alert(JSON.stringify(data));
            $scope.wellRated = data;
        })
        .error(function(data) {
            alert('erreur : ' + data);
        });
}]);

ReadIT.controller('add-oeuvre-controller',['$scope','serviceDetails',function($scope, serviceDetails) {
    $scope.newComment = {};
    $scope.chapters = [];
    $scope.categories = [];
    $scope.authors = [];
    $scope.addAuthor =function() {
        if($scope.newAuthor == '') return;
        //alert(JSON.stringify($scope.authors));
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
            })
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
ReadIt.controller('update-oeuvre-controller',['$scope','$stateParams','serviceDetails',function($scope, $stateParams, serviceDetails) {
    $scope.newComment = {};
    $scope.chapters = [];
    $scope.categories = [];
    $scope.authors = [];
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
        //alert(JSON.stringify($scope.authors));
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
        if (!confirm('etes vous sure de vouloir sauvegarder ' + $scope.name + ' ?'))
            return;
        $scope.newNumber = Math.floor($scope.newNumber) + 1;
        serviceDetails.updateOeuvre({
            _id:$stateParams.id,
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
        })
            .success(function(data) {
            })
            .error(function(err) {
                alert('une erreure est survenue lors de la sauvegarde');
            });
    };
}]);