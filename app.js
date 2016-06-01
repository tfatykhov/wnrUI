// app.js initial configuration for various service providers
(function () {

    'use strict';

    var WnrUIApp = angular.module('WnrUIApp', ['ngRoute','ui.router', 'ngMaterial','flow','ngMap', 'ngStorage', 'ngMessages', 'formlyMaterial', 'formly']);
    
     WnrUIApp.config(function ($controllerProvider, $stateProvider, $httpProvider, $urlRouterProvider, $mdThemingProvider, formlyConfigProvider,flowFactoryProvider) {
    $controllerProvider.allowGlobals();
    $stateProvider
      .state('home', {
        controller: 'MainController',
        controllerAs: 'vm',
        abstract: true
      })
      .state('list', {
        url: '/list',        
        templateUrl: 'templates/proptile.html',
        controller : function ($scope){
        	$scope.getProps();
            $scope.vm.title = 'Home Status';        	
        },
        data: {
          title: 'Home Status'
        }
      })    
      .state('addNew', {
        url: '/new',
        templateUrl: 'templates/addnew.html',
        controller : function ($scope){
        	$scope.startNewForm();
         //   $scope.vm.title = 'Add New';          	
        },
        data: {
          title: 'Add New form'
        }
      })
      .state('cams', {
        url: '/cams',
        templateUrl: 'templates/camera.tmpl.html', 
        controller : function($scope){
        	$scope.getCams();
         $scope.vm.title = 'Cameras';                 
        },
        data: {
          title: 'Cameras'
        }
      })      
       .state('search', {
        url: '/search',
        templateUrl: 'templates/addrgeo.tmpl.html', 
        data: {
          title: 'Search'
        }
      });
     $urlRouterProvider.otherwise('list');
     formlyConfigProvider.disableWarnings =true;
     
     formlyConfigProvider.setType({
    	 name:'flowImg',
    	 templateUrl: 'flow-image.html'
     });
     
    $mdThemingProvider.theme('default')
      .primaryPalette('blue-grey')
      .dark();
    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    $mdThemingProvider.theme('dark-blue-grey').backgroundPalette('blue-grey').dark();         
    $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
    $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();         
     //formlyConfigProvider.extras.errorExistsAndShouldBeVisibleExpression = "true";
     $httpProvider.defaults.cache = true;
     
     flowFactoryProvider.defaults = {
    		    target: function(FlowFile,FlowChunk,isTest){
    		    	var base= '/tp/image';
    		    	console.log('upload def: ');
    		    	console.log('Path: '+base+FlowFile.path);
    		    return base+FlowFile.path;	
    		    },
    		    permanentErrors: [404, 500, 501], //need to revise to enable retries
    		    maxChunkRetries: 1,
    		    chunkRetryInterval: 5000,
    		    simultaneousUploads: 10,
    		    method: 'octet',
    		    uploadMethod : 'POST',
    		    chunkSize : 10485760, 
    		    testChunks : false,
    		    singleFile: true
    		  };
     		  flowFactoryProvider.supportDirectory="false";
/*    		  flowFactoryProvider.on('catchAll', function (event) {
    		    console.log('catchAll', arguments);
    		  });  */  
     });
})();