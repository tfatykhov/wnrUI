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
                HomeComponents.geommarkers=[];
                HomeComponents.details={};
                HomeComponents.categories={};
                function setState(state){
                   currState = state;
                }
                
                function clearGeoMarkers() {
                    HomeComponents.geommarkers=[]
                }
                
                function getGeoMarkers() {
                    return HomeComponents.geommarkers;
                }
                
                function addGeoMarker(marker){
                    HomeComponents.geommarkers.push(marker);
                }
                
                function round(value, precision) {
                    var multiplier = Math.pow(10, precision || 0);
                    return Math.round(value * multiplier) / multiplier;
                }
                
                function getUvIndex(val){
                    var value;
                    value=parseInt(val);
                    return (value <=2 ? 'Minimal' : value <=4 ? 'Low' : value<=6 ? 'Moderate' : 'High');
                }
                
                function getState(){ return currState}
                
                function getSummary(bfp){
                    var req = {
                    		cache : false,
                            method: 'GET',
                            url: '/freeboard/MySummaryJson?bfp='+bfp
                        }
                       return $http(req)
                           .then(function(response){ console.log('getLightts was executed from '+req.url);
                                                    HomeComponents.homeData=response.data;
                                                    },
                                 function(response){console.log('url: '+req.url+' error '+JSON.stringify(response));return 'eror'});                    
                };
                
                function getLights(bfp){
                    var req = {
                    		cache : true,
                            method: 'GET',
                            url: '/freeboard/LightControl?bfp='+bfp
                        }
                       return $http(req)
                           .then(function(response){ console.log('getLightts was executed from '+req.url);
                                                    HomeComponents.lights=response.data.lights;
                                                   },
                                 function(response){console.log('url: '+req.url+' error '+JSON.stringify(response));return 'eror'});                    
                };
                function getCategory(category){
                    var req = {
                    		cache : true,
                            method: 'GET',
                            url: '/red/sensors/'+category
                        }
                       return $http(req)
                           .then(function(response){ console.log('getLCategory was executed from '+req.url);
                                                    HomeComponents.categories[category]=response.data;
                                                   },
                                 function(response){console.log('url: '+req.url+' error '+JSON.stringify(response));return 'eror'});                    
                };                
                
                function getCategoryList(category){
                    return HomeComponents.categories[category] || [];
                }
                
                function getCameras(bfp){
                    var req = {
                    		cache : false,
                            method: 'GET',
                            url: '/freeboard/MyCameras/json?bfp='+bfp,
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
                
                function setOnOff(o){
                    var req = {
                        method: 'POST',
                        url: "/red/ifttt",
                        headers :{
                        'Content-Type': 'application/json'
                        },
                        data: {
                            "winkName": o.name,
                            "type":"light",
                            "cmd":(o.powered ? "on" : "off")
                        }
                    }
                    if('norm_brightness' in o) req.data.level=o.norm_brightness;                    
                    return $http(req).then(function(){return 'ok'},function(){console.log('url: '+req.url+' unreachable');return 'error'});
                }
                function setLockUnlock(l){
                      var req = {
                        method: 'POST',
                        url: "/red/ifttt",
                        headers :{
                        'Content-Type': 'application/json'
                        },
                        data: {
                            "winkName": l.name,
                            "type":"lock",
                            "cmd":(l.locked ? "lock" : "unlock")
                        }
                    }                  
                    return $http(req).then(function(){return 'ok'},function(){console.log('url: '+req.url+' unreachable');return 'error'});                  
                }
                function activateScene(s){
                      var req = {
                        method: 'POST',
                        url: "/red/ifttt",
                        headers :{
                        'Content-Type': 'application/json'
                        },
                        data: {
                            "winkName": s.name,
                            "type":"shortcut"
                        }
                    }                  
                    return $http(req).then(function(){return 'ok'},function(){console.log('url: '+req.url+' unreachable');return 'error'});                      
                }
                function getHomeDetails(bfp){
                    var req = {
                    		cache : false,
                            method: 'GET',
                            url: '/red/getApplDataJson?bfp='+bfp,
                            headers :{
                                'Cache-Control': 'no-cache'
                            }
                        }
                       return $http(req)
                           .then(function(response){console.log('getHomeDetails was executed from '+req.url);HomeComponents.details=response.data;
                            }
                                 ,function(response){console.log('url: '+req.url+' error '+JSON.stringify(response));return 'eror'});                    
                    
                };
                
                function homeDetails(){
                    return HomeComponents.details;
                };
                
                function getFamily(bfp){
                    var req = {
                    		cache : false,
                            method: 'GET',
                            url: '/freeboard/MyFamilyjson?bfp='+bfp,
                            headers :{
                                'Cache-Control': 'no-cache'
                            }
                        }
                       return $http(req)
                           .then(function(response){console.log('getFamily was executed from '+req.url);HomeComponents.family=response.data;
                            }
                                 ,function(response){console.log('url: '+req.url+' error '+JSON.stringify(response));return 'eror'});                    
                };                
                
                function getFamilyList(){
                    return HomeComponents.family.geo_locations ||  [];
                }
                
                function getHomeRadius(){
                    return HomeComponents.family.home_radius || 100;
                }
                
                function getWeather(){
                    if ('weather' in HomeComponents.homeData){
                        if('Bloomsky' in HomeComponents.homeData.weather){
                            var b = HomeComponents.homeData.weather.Bloomsky;
                            HomeComponents.homeData.weather.currently.dual_temp= round(b.TemperatureC,1)+'C / '+b.TemperatureF+'F';
                            HomeComponents.homeData.weather.currently.humidity_pct=b.Humidity+'%';
                            HomeComponents.homeData.weather.currently.uvindex=getUvIndex(b.UVIndex);
                        }
                    }
                    return ('weather' in HomeComponents.homeData ? HomeComponents.homeData.weather : {});
                }
                
                function getHomePosition(){
                    return ('home_lat' in HomeComponents.homeData ? {'lat' : HomeComponents.homeData.home_lat,'lng': HomeComponents.homeData.home_lon} : {});
                }
                
                function getHomeComponents(){
                    return ('home_components' in HomeComponents.homeData ? HomeComponents.homeData.home_components : []);
                }
                function setHC(idx,comp){
                    HomeComponents.homeData.home_components[idx]=comp;
                }
                function setWeather(wtr){
                    HomeComponents.homeData.weather=wtr;
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
                    setOnOff : setOnOff,
                    setLockUnlock : setLockUnlock,
                    activateScene : activateScene,
                    setHomeComponents : setHC,
                    setWeather : setWeather,
                    getSummary : getSummary,
                    getCameras : getCameras,
                    getLights : getLights,
                    getCamList : getCamList,
                    getLightList : getLightList,
                    getHomeComponents: getHomeComponents,
                    getHomePosition : getHomePosition,
                    getWeather : getWeather,
                    getCategory : getCategory,
                    getCategoryList : getCategoryList,
                    setState : setState,
                    getState : getState,
                    getFamily : getFamily,
                    getFamilyList : getFamilyList,
                    getHomeRadius : getHomeRadius,
                    clearGeoMarkers : clearGeoMarkers,
                    getGeoMarkers : getGeoMarkers,
                    addGeoMarker : addGeoMarker,
                    getHomeDetails : getHomeDetails,
                    homeDetails : homeDetails,
                    refreshCamImgUrl : refreshCamImgUrl
                };                
                return methods;
            };        
})();