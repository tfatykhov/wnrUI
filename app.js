// app.js initial configuration for various service providers
(function () {

    'use strict';

    var WnrUIApp = angular.module('WnrUIApp', ['ngWebSocket','ui.router', 'ngMaterial','ngMap', 'ngStorage', 'ngMessages', 'formlyMaterial', 'formly',  'ds.clock'])
        .factory('WsComms',function($rootScope,$websocket,$timeout){
            var wsUri = "ws:";
            var loc = window.location;
            if (loc.protocol === "https:") { wsUri = "wss:"; }
            wsUri += "//" + loc.host + "/ws/winkStat"; 
            var collection=[];            
            var connect = function(){
                var dataStream = $websocket (wsUri, null, {reconnectIfNotNormalClose: true});
                //dataStream.ReconnectIfNotNormalClose=true;

                dataStream.onMessage(function(message){
                    collection.splice(0,1,JSON.parse(message.data));
                    $rootScope.$broadcast('WS: incoming');

                });
    /*            dataStream.onClose(function(){
                    $timeout(function(){console.log('ws closed.. reconnecting');dataStream = $websocket (wsUri)},3000);
                });

                dataStream.onError(function(){
                    $timeout(function(){console.log('ws error.. reconnecting');dataStream = $websocket (wsUri)},3000);
                });            
                */
            }            
            var methods = {
                connect : connect,
                collection : collection,
                 get: function() {
                    dataStream.send(JSON.stringify({ action: 'get' }));
                }
            }
            return methods;
        });
    
    WnrUIApp.config(function ($controllerProvider, $stateProvider, $httpProvider, $urlRouterProvider, $mdThemingProvider, formlyConfigProvider) {
        $controllerProvider.allowGlobals();
        $stateProvider
          .state('home', {
            abstract: true,
             data: {
              requireLogin : true
            }
          })
          .state('login', {
            url: '/login',              
            templateUrl: 'templates/loginPage.tmpl.html',
            controller : function ($scope){
                $scope.vm.title = 'Login';        	
            },
            data: {
              requireLogin : false,                
              title: 'Login'
            }
          })        
          .state('summary', {
            url: '/summary',              
            templateUrl: 'templates/summary.tmpl.html',
            controller : function ($scope){              
                //$scope.getProps();
                $scope.vm.title = 'Home Status';        	
            },
            data: {
              requireLogin : true,                
              title: 'Home Status'
            }
          })    
          .state('controls', {
            url: '/controls',    
            templateUrl: 'templates/controls.tmpl.html',
            controller : function ($scope){
                $scope.getLights();
                $scope.vm.title = 'Controls';          	
            },
            data: {
              title: 'Controls',
              requireLogin : true,            
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
              requireLogin : true,                
              title: 'Cameras'
            }
          })      
           .state('family', {
            url: '/search',          
            templateUrl: 'templates/myfamily.tmpl.html', 
            controller : function($scope,$interval,HomeComponents){
                //$scope.getCams();
          $scope.HomePosition = new google.maps.LatLng($scope.vm.HomePosition.lat,$scope.vm.HomePosition.lng);     
           $scope.mapReady = function(map){
               $scope.mArray=HomeComponents.getGeoMarkers();
               angular.forEach($scope.mArray,function(value){
                   value.setMap(null);
               });
                HomeComponents.clearGeoMarkers();
                $scope.bounds = new google.maps.LatLngBounds();
                $scope.vm.map = map;
                $scope.vm.map.setCenter($scope.HomePosition);
                $scope.HomeMarker = new google.maps.Marker({
                    map: $scope.vm.map,
                    position:$scope.HomePosition,
                    label:{
                        text:'H',
                        fontSize: '12px'
                    },
                    icon:{
                        labelOrigin: new google.maps.Point(16,12),
                        url: 'images/markers/map-marker-2-32_blue.png'
                    }
                });
                HomeComponents.addGeoMarker($scope.HomeMarker);
                $scope.bounds.extend($scope.HomePosition);
                
                    HomeComponents.getFamily()
                    .then(function(){
                        $scope.geo_locations=HomeComponents.getFamilyList();
                        $scope.home_radius=HomeComponents.getHomeRadius();
                        $scope.homeCircle = new google.maps.Circle({
                        strokeColor: '#99e6ff',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: ' #99e6ff',
                        fillOpacity: 0.25,
                        map:  $scope.vm.map,
                        center: $scope.HomePosition,
                        radius: parseInt($scope.home_radius)
                        });                    
                        angular.forEach( $scope.geo_locations,function(g,key){
                            var mPosition = new google.maps.LatLng(g.lat,g.lng);
                            var marker = new google.maps.Marker({
                                map: $scope.vm.map,
                                position: mPosition,
                                label:{
                                text:g.name,
                                fontSize: '12px'
                            },
                            icon:{
                                labelOrigin: new google.maps.Point(16,12),
                                url: 'images/markers/map-marker-2-32_purple.png'
                            }                        
                            });
                            HomeComponents.addGeoMarker(marker);
                            $scope.bounds.extend(mPosition);
                        }); 
                    $scope.vm.map.fitBounds($scope.bounds);                    
                    });
            }
                               
             $scope.vm.title = 'My Family';
            },
            data: {
              requireLogin : true,                
              title: 'My Family'
            }
          });
         $urlRouterProvider.otherwise('/login');
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

          $httpProvider.interceptors.push(function ($timeout, $q, $injector) {
            var utils, $http, $state;

            // this trick must be done so that we don't receive
            // `Uncaught Error: [$injector:cdep] Circular dependency found`
            $timeout(function () {
              utils = $injector.get('utils');
              $http = $injector.get('$http');
              $state = $injector.get('$state');
            });

            return {
              responseError: function (rejection) {
                if (rejection.status !== 401) {
                  return rejection;
                }

                var deferred = $q.defer();

                utils.loginUser()
                  .then(function () {
                    deferred.resolve( $http(rejection.config) );
                  })
                  .catch(function () {
                    $state.go('login');
                    deferred.reject(rejection);
                  });

                return deferred.promise;
              }
            };
          });                        
    });
    WnrUIApp.run(function($rootScope,$state,utils){
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var requireLogin = toState.data.requireLogin;
        if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
            event.preventDefault();  
            $state.go('login')
            console.log('no user yet');
        }
         //else $state.go(toState.name, toParams);          
      });
    });
})();