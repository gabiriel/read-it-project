'use strict';

// Declare app level module which depends on views, and components

angular.module('readIt', ['ui.router'])
    .config(function($locationProvider, $stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to /index
    $urlRouterProvider.otherwise('/');

    // $locationProvider.html5Mode(true).hashPrefix('!');
    // Now set up the states
    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: 'views/home.html'
        })
        .state('index', {
            url: '/',
            templateUrl: 'views/home.html'
        })
        .state('home', {
            url: '/',
            templateUrl: 'views/home.html'
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
            url: "/forgotpassword",
            templateUrl: "views/forgotpassword.html"
        })
        .state('resetpassword',{
            url:'/user/reset/:token',
            templateUrl:"views/resetpassword.html"
        })
        .state('userDisplay', {
            url: "/user/display",
            templateUrl: "views/user_display.html"
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
        }).state('import', {
            url : '/import',
            templateUrl : '/views/import.html'
        })
    });