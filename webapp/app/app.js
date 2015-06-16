'use strict';

// Declare app level module which depends on views, and components

angular.module('readIt', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to /index
    // $urlRouterProvider.otherwise("/index");
    // Now set up the states
    $stateProvider
        .state('index', {
            url: "/index",
            templateUrl: "views/home.html"

        })
        .state('home', {
            url: "/index",
            templateUrl: "views/home.html"
        })
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html"
        })
        .state('signin', {
            url: "/inscription",
            templateUrl: "views/signin.html"
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
        })
    });