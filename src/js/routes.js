'use strict';

/**
 * Route configuration for the Songs module.
 */
angular.module('Songs').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'templates/jukebox.html'
            })
            .state('findHost', {
                url: '/findhost',
                templateUrl: 'templates/findHost.html'
            })
            .state('libary', {
                url: '/libary',
                templateUrl: 'templates/library.html'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html'
            })
            .state('createaccount', {
                url: '/createaccount',
                templateUrl: 'templates/createaccount.html'
            })
            .state('host', {
                url: '/host',
                templateUrl: 'templates/host.html'
            })
            .state('manageaccount', {
                url:'/manageaccount',
                templateUrl: 'templates/manageAccount.html'
            })
            .state('managejukebox', {
                url: '/managejukebox',
                templateUrl: 'templates/manageJukebox.html'
            })
    }
]);