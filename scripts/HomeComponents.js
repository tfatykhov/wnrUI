(function(){

    'use strict';

    angular
        .module('WnrUIApp')
        .factory('HomeComponents', HomeComponents);
            function HomeComponents($rootScope,$http,$interval) {
                var currState;
                HomeComponents.cameras=[];
                HomeComponents.lights=[];
                HomeComponents.homeData={};
                function setState(state){
                   currState = state;
                };
                
                function getState(){ return currState}
                
                function getSummary(){
                    var req = {
                    		cache : false,
                            method: 'GET',
                            url: '/freeboard/MySummaryJson'
                        }
                       return $http(req)
                           .then(function(response){ console.log('getLightts was executed from '+req.url);
                                                    HomeComponents.homeData=response.data;
                                                    },
                                 function(response){console.log('url: '+req.url+' error '+JSON.stringify(response));return 'eror'});                    
                };
                
                function getLights(){
                    var req = {
                    		cache : true,
                            method: 'GET',
                            url: '/freeboard/LightControl'
                        }
                       return $http(req)
                           .then(function(response){ console.log('getLightts was executed from '+req.url);
                                                    HomeComponents.lights=response.data.lights;
                                                   },
                                 function(response){console.log('url: '+req.url+' error '+JSON.stringify(response));return 'eror'});                    
                };
                
                function getCameras(){
                    var req = {
                    		cache : false,
                            method: 'GET',
                            url: '/freeboard/MyCameras/json',
                            headers :{
                                'Cache-Control': 'no-cache'
                            }
                        }
                       return $http(req)
                           .then(function(response){console.log('getCameras was executed from '+req.url);HomeComponents.cameras=response.data.cameras;
                            }
                                 ,function(response){console.log('url: '+req.url+' error '+JSON.stringify(response));return 'eror'});                    
                };
                
                function getCamList(){
                    return HomeComponents.cameras ||  [];
                };
                
                function getLightList(){
                    return HomeComponents.lights || [];
                }
                
                function getWeather(){
                    return ('weather' in HomeComponents.homeData ? HomeComponents.homeData.weather : {});
                }
                
                function getHomePosition(){
                    return ('home_lat' in HomeComponents.homeData ? {'lat' : HomeComponents.homeData.home_lat,'lng': HomeComponents.homeData.home_lon} : {});
                }
                
                function getHomeComponents(){
                    return ('home_components' in HomeComponents.homeData ? HomeComponents.homeData.home_components : []);
                }
                
                function refreshCamImgUrl(){
                   $interval(function(){
                       if ('cameras' in HomeComponents && HomeComponents.cameras.length>0 && currState=='cams'){
                           angular.forEach(HomeComponents.cameras,function(value,key){
                               if(typeof HomeComponents.cameras[key].origUrl==='undefined') HomeComponents.cameras[key].origUrl=value.url;
                               HomeComponents.cameras[key].url=HomeComponents.cameras[key].origUrl + (HomeComponents.cameras[key].origUrl.indexOf("?") == -1 ? "?" : "&") + Date.now();
                           });
                           $rootScope.$broadcast('CAMERAS: reload');
                       }
                   },30000); 
                };
                var methods= {
                    getSummary : getSummary,
                    getCameras : getCameras,
                    getLights : getLights,
                    getCamList : getCamList,
                    getLightList : getLightList,
                    getHomeComponents: getHomeComponents,
                    getHomePosition : getHomePosition,
                    getWeather : getWeather,
                    setState : setState,
                    getState : getState,
                    refreshCamImgUrl : refreshCamImgUrl
                };                
                return methods;
            };        
})();