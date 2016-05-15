// app.js initial configuration for various service providers
(function () {

    'use strict';

    var HomeReadyApp = angular.module('HomeReadyApp', ['ngMaterial','ngMap', 'ngStorage', 'ngMessages']);
    
    HomeReadyApp.config(function ($controllerProvider, $httpProvider, $mdThemingProvider) {
    $controllerProvider.allowGlobals();
    $httpProvider.defaults.cache = true;    
    $mdThemingProvider.theme('default')
	     .primaryPalette('indigo')
	     .accentPalette('light-blue')
	     .warnPalette('deep-orange')
	     .backgroundPalette('grey');
     });
})();