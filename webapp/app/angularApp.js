'use strict';

// Declare app level module which depends on views, and components

angular.module('readIt', ['ui.router', 'ui.calendar', 'ngAnimate', 'ngSanitize', 'mgcrea.ngStrap','wysiwyg.module'])
    .config(function($locationProvider, $stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to /index
    $urlRouterProvider.otherwise('/');

    // $locationProvider.html5Mode(true).hashPrefix('!');
    // Now set up the states
    $stateProvider
        .state('/', {
            onEnter: ['$state', function($state){
                $state.go('home');
            }]
        })
        .state('index', {
            onEnter: ['$state', function($state){
                $state.go('home');
            }]
        })
        .state('home', {
            url: '/',
            templateUrl: 'views/home.html',
            resolve: {
                postPromise: ['events', function(events){
                    return events.getDisplayed();
                }]
            }
        })
        .state('error', {
            url: '/error',
            templateUrl: "views/error.html",
            controller: 'AuthController'
        })
        .state('signin', {
            url: '/signin',
            templateUrl: 'views/signin.html',
            controller: 'AuthController',
            onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                    $state.go('home');
                }
            }]
        })
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'AuthController',
            onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                    $state.go('home');
                }
            }]
        })
        .state('logout', {
            url: '/logout',
            controller: 'AuthController',
            onEnter: ['$state', 'auth', function($state, auth){
                auth.logOut();
                $state.go('home');
            }]
        })
        .state('forgotpassword', {
            url: '/forgotpassword',
            templateUrl: 'views/forgotpassword.html',
            controller: 'UserForgotPasswordController'

        })
        .state('resetpassword',{
            url:'/user/reset/:token',
            templateUrl: 'views/resetpassword.html',
            controller: 'UserResetPasswordController'
        })
        .state('userDisplay', {
            url: "/user/display/:user",
            templateUrl: "views/user_display.html",
            controller: 'UserDisplay'
        })
        .state('about', {
            url: "/about",
            templateUrl: "views/about.html"
        })
        .state('contact', {
            url: "/contact",
            templateUrl: "views/contact.html"
        })
        .state('termsAndConditions', {
            url: "/terms",
            templateUrl: "views/terms_and_conditions.html"
        })
        .state('import', {
            url : '/import',
            templateUrl : '/views/import.html',
            controller: 'ImportTsvController',
            onEnter: ['$state', 'auth', function($state, auth){
                if(!auth.isAdmin()){
                    $state.go('error');
                }
            }]
        })
        .state('adminevent', {
            url: '/admin/event',
            templateUrl: "views/admin/event.html",
            controller: 'AdminEventController',
            onEnter: ['$state', 'auth', function($state, auth){
                if(!auth.isLoggedIn()){
                    $state.go('error');
                }
            }],
            resolve: {
                postPromise: ['events', function(events){
                    return events.getAll();
                }]
            }
        })
        .state('adminUserCreate', {
            url: '/admin/user/create',
            templateUrl: "views/admin/create_user.html",
            controller: 'AuthController',
            onEnter: ['$state', 'auth', function($state, auth){
                if(!auth.isAdmin()){
                    $state.go('error');
                }
            }]
        })
        .state('adminAddOeuvre', {
            url: '/admin/oeuvre/create',
            templateUrl: "views/admin/create_oeuvre.html",
            controller: 'add-oeuvre-controller',
            onEnter: ['$state', 'auth', function($state, auth){
                if(!auth.isAdmin()) {
                    $state.go('error');
                }
            }]
        })
       /* .state('adminInterface', {
            url: '/admin/home',
            templateUrl: "views/admin/home.html",
            controller: 'AuthController',
            onEnter: ['$state', 'auth', function($state, auth){
                if(!auth.isAdmin()){
                    $state.go('error');
                }
            }]
        })*/
        .state('ListOeuvre', {
            url : '/oeuvres',
            templateUrl : 'views/ListOeuvre.html',
            controller: 'OeuvreCtrl'
        })
        .state('oeuvre',{
            url:'/oeuvre/:id',
            templateUrl:'views/oeuvre.html',
            controller: 'OeuvreDetailCtrl',
            resolve: {
                checkParam: ['$state', '$stateParams', function ($state, $stateParams) {
                    if(typeof $stateParams.id === 'undefined' || $stateParams.id == "")
                        return $state.go('error', {}, {location: false});
                }]
            }
        })
        .state('search',{
            url:'/search/:title',
            templateUrl:'views/SearchResults.html',
            controller: 'SearchCtrl'
        })
        .state('message',{
            url:'/message/:username',
            templateUrl:'views/message.html',
            controller: 'messageCtrl'
        })
        .state('messageList', {
            url: '/messages/list',
            templateUrl: 'views/listMessages.html',
            controller: 'messageListCtrl'
        })
        .state('adminSondageCreate', {
            url: '/admin/sondage/display',
            templateUrl: 'views/admin/listSondage.html',
            controller: 'SondagesCtrl',
            onEnter: ['$state', 'auth', function($state, auth){
                if(!auth.isAdmin()){
                    $state.go('error');
                }
            }]
        })
        .state('friendAskList', {
            url: '/friends/requests',
            templateUrl: 'views/addRequests.html',
            controller: 'addRequestsCtrl',
            onEnter: ['$state', 'auth', function($state, auth){
                if(!auth.isLoggedIn()){
                    $state.go('error');
                }
            }]
        })

        .state('adminUpdateOeuvre',{
            url:'/admin/oeuvre/upate/:id',
            templateUrl: "views/admin/update_oeuvre.html",
            controller: 'update-oeuvre-controller',
            onEnter: ['$state', 'auth', function($state, auth){
                if(!auth.isAdmin()) {
                    $state.go('error');
                }
            }]
        });
    }
);