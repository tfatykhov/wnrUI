// Main application controller. Data init.Functions for menus and form validation, etc.
(function () {

    'use strict';

    angular.module('WnrUIApp')
        .controller('MainController', ['$scope', '$rootScope', '$http', '$timeout', '$mdSidenav', '$localStorage', '$mdDialog', '$mdMedia', '$state','md5',  'HomeComponents',  'NgMap','WsComms', 'UserAuth','utils', MainController])
        .directive('fallbackSrc',fallbackSrc)
        .directive('changeDimmer',['$http', changeDimmer]); 

        function changeDimmer($http) {
            return {
                restrict: 'A',
                link: function($scope, element, attrs) {
                    element.on('$md.pressup', function() {
                    var o = $scope.l;
                    var req = {
                        method: 'POST',
                        url: "/red/ifttt",
                        headers :{
                        'Content-Type': 'application/json'
                        },
                        data: {
                            "winkName": o.name,
                            "type":"light",
                            "cmd":(o.norm_brightness>0 ? "on" : "off"),
                            "level":o.norm_brightness
                        }
                    }                   
                    $http(req);//.then(function(){console.log('Light control executed '+req.url)},function(){console.log('url: '+req.url+' unreachable')});                        
                    })
                }
            }
        };
    
        function fallbackSrc(){
            var fallbackSrc = {
                    link: function postLink(scope,iElement,iAttrs){
                        iElement.bind('error', function(){
                            angular.element(this).attr("src",iAttrs.fallbackSrc);
                        });
                    }
            }
            return fallbackSrc;
        };    
    
function MainController($scope, $rootScope, $http, $timeout, $mdSidenav, $localStorage, $mdDialog, $mdMedia,  $state,md5, HomeComponents, NgMap,WsComms,UserAuth,utils) {

    var vm = this;
    var originatorEv;
    vm.menuItems=[];
 	$scope.storage=$localStorage;
    /*Callable functions       */
    vm.DialogController = DialogController;
    vm.toggleItemsList = toggleItemsList;
    vm.selectItem = selectItem;
    vm.login = login;
    vm.showForecast = showForecast;
    vm.showFamily = showFamily;
    vm.onOff = onOff;
    vm.activateScene = activateScene;
    vm.lockUnlock = lockUnlock;
    vm.ShowModal = ShowModal;
    vm.showCategory = showCategory;
    /***************************/    
    $scope.wsComms = WsComms;
    vm.HomeComponents = HomeComponents;
    vm.HomeDetails={};
    vm.HomeWeather = {};
    vm.HomePosition = {};
    vm.ActivityLog =[];
    var opt = {detectScreenOrientation : false};
    var fp=new Fingerprint2(opt);
    fp.get(function(result){
    vm.myFngrp=result;
    });    
    $scope.init = function () {        
    	vm.menuItems = [
    	                {
    	                  name: 'Home Status',
    	                  icon: 'home',
    	                  sref: 'summary'
    	                },
    	                {
    	                  name: 'Controls',
    	                  icon: 'donut_small',
    	                  sref: 'controls'
    	                },
    	                {
    	                  name: 'Cameras',
    	                  icon: 'videocam',
    	                  sref: 'cams'
    	                },
    	                {
    	                  name: 'Family',
    	                  icon: 'group',
    	                  sref: 'family'
    	                },
    	                {
    	                  name: 'Configuration',
    	                  icon: 'settings',
    	                  sref: 'config'
    	                }            
    	          /*      {
    	                    name: 'Upload Pictures',
    	                    icon: 'add_circle',
    	                    sref: 'upPic'
    	                  },*/      
/*    	                {
    	                    name: 'Search',
    	                    icon: 'search',
    	                    sref: 'search'
    	                  }*/
/*    	                {
    	                    name: 'Help',
    	                    icon: 'help',
    	                    sref: 'help'
    	                  }*/
    	              ];
/*        ApprForm.getPropList('/tp/form/props').then(function(response){
        	$scope.vm.propertyList=(response=='error' ? ApprForm.defaultPropList() : response.prop_list);
        });*/
//        $scope.vm.propertyList=getLocalPropList($scope.storage);      
    };
//    $scope.init();
    
    $scope.getSummary = function (){
        HomeComponents.getSummary()
        .then(function(){
            vm.HomeComponents=HomeComponents.getHomeComponents();
            vm.HomePosition=HomeComponents.getHomePosition();
            vm.HomeWeather=HomeComponents.getWeather();
        });
    }    
    $scope.getLights = function(){
        HomeComponents.getLights()
        .then(function(){
            vm.lights=HomeComponents.getLightList();
            console.log('got lights');
            console.log(vm.lights);
        });
    }
    
    $scope.getCams = function(){
        HomeComponents.getCameras()
        .then(function(){
           vm.cameras=HomeComponents.getCamList();
        })
    }
    
    function login(user,pass){
        UserAuth.login(user,md5.createHash(user+':'+pass),vm.myFngrp)
            .then(function(response){
            console.log(response);
            if (response.status==200) {
                $rootScope.currentUser=user;
                vm.user=user;
                $scope.init();                
                WsComms.connect();
                HomeComponents.getHomeDetails()
                .then(function(){
                    vm.HomeDetails=HomeComponents.homeDetails();
                })
                HomeComponents.getSummary()
                .then(function(){
                    vm.HomeComponents=HomeComponents.getHomeComponents();
                    vm.HomePosition=HomeComponents.getHomePosition();
                    vm.HomeWeather=HomeComponents.getWeather();
                });
                HomeComponents.refreshCamImgUrl();             
                $state.go('summary');
            }
        });            
    }
    
// pubSub functions start
    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams) {
        HomeComponents.setState(toState.name);
        console.log('currState:');
        console.log(HomeComponents.getState());
      });
    
    $scope.$on('CAMERAS: reload',function(msg){
        $scope.vm.cameras=HomeComponents.getCamList();
     });
      
    $scope.$on('WS: incoming',function(msg){
        //if ('home_components' in $scope.wsComms.collection[0]) $scope.getSummary();
        if ('home_components' in $scope.wsComms.collection[0]) {
            var c = $scope.wsComms.collection[0].home_components;
            angular.forEach(c,function(value,key){
                var idx = vm.HomeComponents.findIndex(function(element){
                    return (element.type==value.type)
                })
                if (idx!=-1) {
                    vm.HomeComponents[idx]=value;
                    HomeComponents.setHomeComponents(idx,value);
                }
            })
        } 
        if('weather' in $scope.wsComms.collection[0]){
            HomeComponents.setWeather($scope.wsComms.collection[0].weather);
            vm.HomeWeather=HomeComponents.getWeather();
        }
        if('type' in $scope.wsComms.collection[0]){
            var o=$scope.wsComms.collection[0];
            HomeComponents.getHomeDetails()
            .then(function(){
                vm.HomeDetails=HomeComponents.homeDetails();
            })
        }
        if ('varName' in $scope.wsComms.collection[0]){
            var v= $scope.wsComms.collection[0];
            vm[v.varName]=v.varVal;
        }
        if ('alertType' in $scope.wsComms.collection[0]){
            var datetime = new Date();
            var title_tm=datetime.toLocaleTimeString();
            vm.ActivityLog.splice(0,0,{
                dt_tm:title_tm,
                message:$scope.wsComms.collection[0].message
            });
            if (vm.ActivityLog.lenth>50) vm.ActivityLog.pop();
            
        }
   //     if ('weather') in $scope.wsComms.collection[0] $scope.get
/*        console.log('incoming WebSocket Message');
        console.log($scope.wsComms.collection[0]);*/
    });
    
// pubSub functions end        
    

// menu functions start   
    this.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };
    
    function toggleItemsList(navID) { 
        $mdSidenav(navID).toggle();
    };
    
    
    function selectItem (item) {
      //vm.title = item.name;
      vm.toggleItemsList('left');
    };
// menu functions end  

// control functions
function onOff(light) {
    //console.log(light);
    HomeComponents.setOnOff(light)
    .then(function(){
        vm.HomeDetails=HomeComponents.homeDetails();
    })        
};

    function activateScene(scene){
        console.log(scene);
        HomeComponents.activateScene(scene);
    };
    
    function lockUnlock(lock){
        console.log(lock);
        HomeComponents.setLockUnlock(lock)
        .then(function(){
            vm.HomeDetails=HomeComponents.homeDetails();
        })        
    };
    
// control functions end

// modals    
    function ShowModal(category){
    if (category=='propane') category='remaining';
    switch(category){
        case 'presence':
            vm.showFamily();
            break;
        default:
            vm.showCategory(category);
            break;
      }
  }
  function showForecast(ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
        controller: ForecastController,
        templateUrl: 'templates/forecast.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
          locals: { 
        	  "dailyForecast" :$scope.vm.HomeWeather.daily
        },          
        fullscreen: useFullScreen
      })
      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });
    };

  function showCategory(category) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });      
      HomeComponents.getCategory(category)
      .then(function(){
          $mdDialog.show({
            controller: CategoryController,
            templateUrl: 'templates/category.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
              locals: { 
                  "category" :HomeComponents.getCategoryList(category)
            },          
            fullscreen: useFullScreen
          })
      });
  };  
    
  function showFamily(ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });      
      HomeComponents.getFamily()
      .then(function(){
          $mdDialog.show({
            controller: PresenceController,
            templateUrl: 'templates/presence.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
              locals: { 
                  "family" :HomeComponents.getFamilyList()
            },          
            fullscreen: useFullScreen
          })
      });
    };    
    
//TODO - remove    
    $scope.vm.showGallery = function(ev,apprId) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
          controller: GalleryController,
          templateUrl: 'templates/propinfomodal.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          locals: { 
        	  "apprId" :apprId,
        	  "storage" : $scope.storage
        	  },
          fullscreen: useFullScreen
        })
/*        .then(function(answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });*/
        $scope.$watch(function() {
          return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
          $scope.customFullscreen = (wantsFullScreen === true);
        });
      };
      
      $scope.vm.showHelp = function(ev) {
          var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
          $mdDialog.show({
            controller: DialogController,
            templateUrl: 'templates/helpmodal.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: useFullScreen
          })
          $scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
          }, function(wantsFullScreen) {
            $scope.customFullscreen = (wantsFullScreen === true);
          });
        };
        
        $scope.vm.showAddrPrompt = function(ev) {
        	var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        	 $mdDialog.show({
                 controller: GeoDialogController,
                 templateUrl: 'templates/addrgeo.tmpl.html',
                 parent: angular.element(document.body),
                 targetEvent: ev,
                 clickOutsideToClose:false,
                 escapeToClose : false,
                 fullscreen: useFullScreen
               })
               $scope.$watch(function() {
                 return $mdMedia('xs') || $mdMedia('sm');
               }, function(wantsFullScreen) {
                 $scope.customFullscreen = (wantsFullScreen === true);
               });
             };
      
  
  function DialogController($scope, $mdDialog) {
	  
	  $scope.hide = function() {
	    $mdDialog.hide();
	  };
	  $scope.cancel = function() {
	    $mdDialog.cancel();
	  };
	}
    
    function ForecastController($scope, $mdDialog,dailyForecast) {
      $scope.dailyForecast=dailyForecast;
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
    }
    
    function CategoryController($scope, $mdDialog,category) {
      $scope.category=category;
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
    }    
   
    function PresenceController($scope, $mdDialog,family) {
      $scope.family=family;
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
    }    
    
  function GalleryController($scope, $mdDialog,storage,apprId) {
	  $scope.images=CurrForm.getImgAsArray(storage,apprId);
	  $scope.hide = function() {
	    $mdDialog.hide();
	  };
	  $scope.cancel = function() {
	    $mdDialog.cancel();
	  };
	}
  
  function GeoDialogController($scope, $mdDialog) {
	  $scope.gMtypes = "['address']";
	  $scope.gMplaceChanged = function() {
		  $scope.gMplace = this.getPlace();
	  }	
	  
	  $scope.close = function() {
		  alert('close')
			$state.go('list');		  
		    $mdDialog.cancel();
	  };	
	  $scope.hide = function() {
		  alert('close');		  
		$state.go('list');		  
	    $mdDialog.cancel();
	  };
	  $scope.cancel = function() {
		$scope.geoStat='OK';
		$state.go('list');
	    $mdDialog.cancel();
	  };
	  $scope.go = function() {
		if ( $scope.gMplace && 'address_components' in  $scope.gMplace) {
			var addr_cmp=$scope.gMplace.address_components;  
			var str_addr={
			str_addr:"",
			 street_number:"",
			 route:"",
			 locality:"",
			 administrative_area_level_1:"",
			 postal_code:""
			};
		    addr_cmp.forEach(function(c,index){
		    	if ('types' in c && c.types[0] in str_addr) str_addr[c.types[0]]=c.short_name;
		    });
		    str_addr.str_addr=str_addr.street_number+' '+str_addr.route;
		    vm.property.str_addr=str_addr.str_addr;
		    vm.property.city=str_addr.locality;
		    vm.property.zip=str_addr.postal_code;
		    vm.property.state=str_addr.administrative_area_level_1;
		    vm.property.lat=$scope.gMplace.geometry.location.lat();
		    vm.property.lng=$scope.gMplace.geometry.location.lng();
		    $scope.geoStat='OK';
		  }		    
		    $state.go('addNew');
    	    $mdDialog.hide();
	  };
	}
    }
})();