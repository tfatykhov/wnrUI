// Main application controller. Data init.Functions for menus and form validation, etc.
(function () {

    'use strict';

    angular.module('HomeReadyApp')
        .controller('MainController', ['$scope', '$http', '$timeout', '$mdSidenav', '$window', '$mdBottomSheet', '$localStorage', '$mdDialog', '$mdMedia',  'NgMap', 'FormatsFactory', 'ListingsFactory', 'utils', MainController])
        .directive('fallbackSrc',fallbackSrc);

function fallbackSrc(){
	var fallbackSrc = {
			link: function postLink(scope,iElement,iAttrs){
				iElement.bind('error', function(){
					angular.element(this).attr("src",iAttrs.fallbackSrc);
				});
			}
	}
	return fallbackSrc;
}    
    
function MainController($scope, $http, $timeout, $mdSidenav, $window, $mdBottomSheet, $localStorage, $mdDialog, $mdMedia,NgMap,FormatsFactory, ListingsFactory, utils) {
	var vm = this;
	var originatorEv;
	vm.formats = FormatsFactory;
	vm.listings = ListingsFactory;
	vm.listingList=[];
	$scope.geoStat='NOK';
	vm.menuItems=[];
	vm.showInfo=false;
	vm.poly_info=false;
	$scope.storage=$localStorage;
	
	/* public functions definition */
	vm.DialogController = DialogController;
	vm.getLocation = getLocation;
	vm.searchAddr = searchAddr;
	vm.gMplaceChanged = gMplaceChanged;
	vm.setCenter = setCenter;
	vm.showAlert = showAlert;
	vm.centerOnPlace = centerOnPlace;
	vm.fetchPolygons = fetchPolygons;
	vm.mapReady = mapReady;
	vm.loadListings = loadListings;
	vm.clearListings = clearListings;
	/**********************************/
	
	vm.geocoder =  new google.maps.Geocoder();
	$scope.degrees=$window.orientation;
	$scope.vm.m_direction=($scope.degrees==0 || $scope.degrees==180 ? 'up' : 'right');
	$scope.vm.t_direction=($scope.vm.m_direction=='up' ? 'right' : 'up'); 

	vm.gMtypes = "['address']";
	
    $scope.init = function (debug) {
		vm.point = null;
		vm.marker = null;
		vm.subjectPoly = null;
		vm.polys = [];
		vm.labels = [];
		vm.numFetches = 0;
		vm.mlsListings = [];
		vm.hpListings = [];
		vm.filteredListings = [];
		vm.incomeLimit = '';
		vm.DEBUG = debug || false;
    	vm.menuItems = [
    	                {
      	                  name: 'Affordability Calculator',
      	                  icon: 'add_box',
      	                  sref: '',
      	                  cfunc: 'openUrl',
      	                  cfunc_par : 'https://www.homepath.com/calculators_pop/index.html?type=affordability&ht=900'
      	                },    	                
    	                {
      	                  name: 'Help',
      	                  icon: 'help',
      	                  sref: '',
      	                  cfunc: 'openUrl',
      	                  cfunc_par : 'https://www.fanniemae.com/content/fact_sheet/homeready-income-eligibility-tool-tips.pdf'
          	            }, 
          	            {
    	                  name: 'Homes on Market',
      	                  icon: 'home',
      	                  sref: '',
      	                  cfunc: 'loadListings',
      	                  cfunc_par : '"mls homepath"'
          	            }/*,          	            
    	                {
    	                  name: 'Email',
    	                  icon: 'mail',
    	                  sref: '',
    	                  cfunc: 'showToolTips'
    	                }*/
/*    	                {
      	                  name: 'Share',
      	                  icon: 'share',
      	                  sref: '',
      	                  click: 'showToolTips'
      	                } */    	                
    	              ];

    };
    $scope.init(false);
 	
    
 	function mapReady(map){
 		var clusterStyles = [
 		                    {
 		                      url: 'node_modules/markerclusterer/images/m1.png',
 		                      height: 53,
 		                      width: 53
 		                    },
 		                    {
 	 		                      url: 'node_modules/markerclusterer/images/m2.png',
 	 		                      height: 56,
 	 		                      width: 56
 	 		                    },
 	 		                    {
 	  		                      url: 'node_modules/markerclusterer/images/m3.png',
 	  		                      height: 66,
 	  		                      width: 66
 	  		                    },
 	  		                    {
 	  		                      url: 'node_modules/markerclusterer/images/m4.png',
 	  		                      height: 78,
 	  		                      width: 78
 	  		                    },
 	  		                    {
 	  		                      url: 'node_modules/markerclusterer/images/m5.png',
 	  		                      height: 90,
 	  		                      width: 90
 	  		                    }
 		                  ];
 		vm.map = map;
 		vm.clusterer = new MarkerClusterer($scope.map,[],{
			averageCenter:true,
			maxZoom:16,
			minimumClusterSize:10,
			styles:clusterStyles,
		});	
 	google.maps.event.addListener(map, 'idle', function(event) {
 	    var cnt = map.getCenter();
 	    cnt.e+=0.000001;
 	    map.panTo(cnt);
 	    cnt.e-=0.000001;
 	    map.panTo(cnt);
 	});
 	 getLocation();		
		if (vm.DEBUG) console.log('Clusterer initialized '+ vm.clusterer);
 	}
 	
	function gMplaceChanged() {
		  vm.gMplace = this.getPlace();
		  if ('geometry' in vm.gMplace){
			vm.lat = vm.gMplace.geometry.location.lat();
			vm.lon = vm.gMplace.geometry.location.lng();
			vm.centerOnPlace(vm.address,vm.lat,vm.lon); 			
		  } else if ('name' in vm.gMplace) vm.searchAddr(vm.geocoder,vm.gMplace.name);
	  }
 	 $scope.getWindowOrientation = function () {
 	    return $window.orientation;
 	  };
 	  
 	  $scope.$watch($scope.getWindowOrientation, function (newValue, oldValue) {
 	    $scope.degrees = newValue;
 	    $scope.vm.m_direction=($scope.degrees==0 || $scope.degrees==180 ? 'up' : 'right');
 	   $scope.vm.t_direction=($scope.vm.m_direction=='up' ? 'right' : 'top');
 	  }, true);

 	  angular.element($window).bind('orientationchange', function () {
 	    $scope.$apply();
 	  });
 	
 	    $scope.callFunction = function (name,param){
        if(angular.isFunction($scope[name]))
           $scope[name](param);
        else if (angular.isFunction($scope.vm[name]))
        	$scope.vm[name](param);
    }
 	
 	    
    function getLocation() {
        if (navigator.geolocation) {
        	vm.address="";
            navigator.geolocation.getCurrentPosition(getPosition, showError);
        } else {
        	 if (vm.DEBUG) console.log("Geolocation is not supported by this browser.");
        }
    }

    function getPosition(position) {
        vm.lat = position.coords.latitude;
        vm.lon = position.coords.longitude;
        vm.zoom = 15;
        var pos=new google.maps.LatLng(vm.lat,vm.lon)
        if ($scope.map){
        	vm.centerOnPlace(vm.address,vm.lat,vm.lon); 
        }
    }
    
    function showError(error) {
    	vm.lat=38.9451033
    	vm.lon=-77.06450970000003;
    	vm.zoom = 15;    	
        var pos=new google.maps.LatLng(vm.lat,vm.lon)
        if ($scope.map) {
		    vm.centerOnPlace(vm.address,vm.lat,vm.lon);        	        	
        }
        switch(error.code) {
            case error.PERMISSION_DENIED:
                if (vm.DEBUG) console.log("User denied the request for Geolocation.")
                break;
            case error.POSITION_UNAVAILABLE:
                if (vm.DEBUG) console.log("Location information is unavailable.")
                break;
            case error.TIMEOUT:
            	 if (vm.DEBUG) console.log("The request to get user location timed out.")
                break;
            case error.UNKNOWN_ERROR:
            	 if (vm.DEBUG) console.log("An unknown error occurred.")
                break;
        }
    }    
    
    $scope.openUrl = function(url){
    	var toolTipUrl= url ||  "http://fanniemae.com";
    	window.open(toolTipUrl,"_blank");
    }

  function searchAddr(geocoder,address) {
	  if (address && address.length == 11 && /^\d+$/.test(address)){ //11 digits FIPS
            var req = {
            		cache : false,
                    method: 'GET',
                    url: '/hr/fips/'+address,
                    headers :{
                        'Cache-Control': 'no-cache'
                    }
                }
            	$http(req).then(function(response){
            		if (vm.DEBUG) console.log('executed: '+req.url);
            		if (vm.DEBUG) console.log(response);
            		vm.lat = response.data.lat;
            		vm.lon = response.data.lng;
            		var pos=new google.maps.LatLng(vm.lat,vm.lon)
                    if ($scope.map){
    				    vm.centerOnPlace(null,vm.lat,vm.lon);
                    }
            		},
            		function(response){
            			if (vm.DEBUG) console.log('url: '+req.url+' error '+JSON.stringify(response));
            		});
	  } else {
		  geocoder.geocode({'address' : address,
			  componentRestrictions: {
				    country: 'USA'
			  	}
			  }, function(results, status){
			  if (status === google.maps.GeocoderStatus.OK) {
				    vm.lat = results[0].geometry.location.lat();
				    vm.lon = results[0].geometry.location.lng();
				    vm.centerOnPlace(address,vm.lat,vm.lon);
			  } else { alert('Unable to geocode: '+ status)
				  }
		  });
	  }
	  };
    
	  function setCenter (event) {
		    vm.lat = event.latLng.lat();
		    vm.lon = event.latLng.lng();
		    vm.centerOnPlace(null,vm.lat,vm.lon);		  
		  }
    
	  function centerOnPlace(address,lat,lng){
		 if(!lat || !lng) {
			 vm.showAlert('Invalig geo position'); 
			 return false;
		 }
		vm.showInfo=false; 
		utils.showWait();
		vm.clearListings();
	  	vm.point=new google.maps.LatLng(lat,lng);
		vm.incomeLimit='';
		if(vm.marker) vm.marker.setMap(null);
		for(var i=0; i < vm.polys.length; i++) vm.polys[i].setMap(null);
		for(var i=0; i < vm.labels.length; i++) vm.labels[i].setMap(null);
		
		// center and zoom map, get bounds
		$scope.map.setCenter(vm.point,$scope.map.getZoom());
		var bounds = $scope.map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var latlo = sw.lat();
		var lnglo = sw.lng();
		var lathi = ne.lat();
		var lnghi = ne.lng();	
		vm.fetchPolygons(lat,lng,latlo,lnglo,lathi,lnghi,address,false,false);
	  }
    
	  function fetchPolygons(lat,lng,latlo,lnglo,lathi,lnghi,addy,show,rooftop){	
		// empty polygons and marker arrays
		vm.polys=[];
		vm.labels=[];
        var req = {
        		cache : false,
                method: 'GET',
                url: '/hr/tracts/point/'+lat+'/'+lng,
            }
        $http(req).then(function(response){
        	var j = response.data;
        	if (vm.DEBUG) console.log ('executed '+ req.url);
        	if (vm.DEBUG) console.log(j);

        	var county = '';
			for(var i=0;i<j.length;i++){
				var d = j[i];
	
				// create polygon
				var geom = [];
				var p = d.geom.match(/\(\(([^)]+)\)/)[1];
				var points = p.split(',');
				for(var n=0; n<points.length; n++) {
					var point = points[n].trim().split(' ');
					geom.push(new google.maps.LatLng(parseFloat(point[1]),parseFloat(point[0])));
				}
				var poly = new google.maps.Polygon({
					paths: geom,
					fillColor: vm.formats.polyFillColor(d.elig),
					fillOpacity: 0.5,
					clickable:true,
					map:$scope.map
				});
				vm.formats.polySetType(poly,(d.subj=='Y' ? 'Active' : 'Normal'));
				if(d.subj=='Y') {
					vm.subjectPoly = poly;
					$scope.map.fitBounds(poly.getBounds());
					county = d.tract.substring(0,5);
					vm.incomeLimit = (d.limit ? vm.formats.fdol(d.limit) : 'No Income Limit');
				}
				
				// label
				//var hom = $('input[name="listings-switch"]').is(":checked") ? 'nodisplay' : '';
				var hom = '';
				var poly_info={
						limit : (d.limit ?  'Income Limit: '+ vm.formats.fdol(d.limit) : ''),
						ami : (d.ami && d.ami>0 ? 'AMI: '+vm.formats.fdol(d.ami) : ''),
						county : (d.county ? d.county : false),
						fips : (d.tract ? 'FIPS: '+ d.tract : false),
						bgColor : vm.formats.polyFillColor(d.elig)
				}
				if(d.subj=='Y') vm.poly_info=poly_info;
				poly.poly_info=poly_info;
				// poly event handlers
				google.maps.event.addListener(poly,"click",function(){
					for (var p in vm.polys) {
						if (vm.polys[p].my_id!== p) vm.formats.polySetType(vm.polys[p],'Normal');
					}
					vm.formats.polySetType(this,'Active');
					$scope.vm.poly_info=this.poly_info;
					$scope.$apply();
					$scope.map.setCenter(this.getCenter(),$scope.map.getZoom());
					$scope.map.fitBounds(this.getBounds());
				}); 
				poly.my_id=i;
				vm.polys.push(poly);				
		}
		if(county){
			// make marker of searched address
			if(show){
				if(rooftop){
					vm.marker = new google.maps.Marker({
						position:o.point,
						map: o.map,
						title: addy,
						icon: 'img/markers/home.png'
					});
//					o.showOutput('G');
				} else {
//					o.showOutput('B');
				}
			}
			
			// county polygon
			var reqC = {
	        		cache : false,
	                method: 'GET',
	                url: '/hr/county/' + county
	            }
	        $http(reqC).then(function(response){
	        	var j3 = response.data;
	        	if (vm.DEBUG) console.log ('executed '+ reqC.url);
	        	if (vm.DEBUG) console.log(j3);
				var geom = [];
				var p = j3.geom.match(/\(\(([^)]+)\)/)[1];
				var points = p.split(',');
				for(var n=0; n<points.length; n++) {
					var point = points[n].trim().split(' ');
					geom.push(new google.maps.LatLng(parseFloat(point[1]),parseFloat(point[0])));
				}
				var county = new google.maps.Polygon({
					paths: geom,
					strokeColor: '#FE2E2E',
					strokeOpacity: 1,
					strokeWeight: 6,
					fillOpacity: 0,
					clickable:false,
					map:$scope.map
				});
				vm.polys.push(county);
				utils.hideWait();
			},
			  function(response){
				utils.hideWait();
    			if (vm.DEBUG) console.log('url: '+req.url+' error '+JSON.stringify(response));
			}); // end of county
		};
		vm.showInfo=true;
		//vm.loadListings('mls',vm.clusterer,vm.listingList);
	  },
	  function(response){
		  utils.hideWait();
		  if (vm.DEBUG) console.log('url: '+req.url+' error '+JSON.stringify(response));
       });
	  }

function clearListings(){
	angular.forEach(vm.listingList, function(value){
		value.marker.setMap(null);
	});
	vm.listingList=[];
	vm.clusterer.clearMarkers();
}	  
	  
function loadListings(type) {
	
	var bounds = $scope.map.getBounds();
	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();
	var area={};
	area.latlo = sw.lat();
	area.lnglo = sw.lng();
	area.lathi = ne.lat();
	area.lnghi = ne.lng();
	area.start = 0;
	area.limit = 500;
	vm.clearListings();
	if (type.indexOf('mls') !=-1){
		utils.showWait();
		vm.listings.getMlsListings(area,vm.clusterer,vm.listingList);
	}
	if (type.indexOf('homepath') !=-1){
		utils.showWait();
		vm.listings.getHopepathListings(area,vm.clusterer,vm.listingList);
	}
	$timeout(function(){
		utils.hideWait();
		$scope.map.fitBounds(bounds);
	},2000);
	//$scope.map.fitBounds(bounds);
}	  
	  
/* modal dialog functions */	  
	  function showAlert(alertText) {
	      alert = $mdDialog.alert({
	        title: 'Attention',
	        textContent: alertText,
	        ok: 'Close'
	      });
	      $mdDialog
	        .show(alert)
	        .finally(function() {
	          alert = undefined;
	        });
	    }	  
	  
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
        .then(function(answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
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
        

        $scope.vm.showGridBottomSheet = function() {
            $scope.alert = '';
            $mdBottomSheet.show({
              templateUrl: 'templates/bottomInfoSheet.html',
              parent: angular.element(document.getElementById('top1')),
              disableParentScroll: false,
              controller: GridBottomSheetCtrl,
              clickOutsideToClose: true
            }).then(function(clickedItem) {
              $mdToast.show(
                    $mdToast.simple()
                      .textContent(clickedItem['name'] + ' clicked!')
                      .position('top right')
                      .hideDelay(1500)
                  );
            });
          };      
  

  function GridBottomSheetCtrl ($scope, $mdBottomSheet) {
	  $scope.items = [
	    { name: 'Hangout', icon: 'hangout' },
	    { name: 'Mail', icon: 'mail' },
	    { name: 'Message', icon: 'message' },
	    { name: 'Copy', icon: 'copy2' },
	    { name: 'Facebook', icon: 'facebook' },
	    { name: 'Twitter', icon: 'twitter' },
	  ];
/*	  $scope.listItemClick = function($index) {
	    var clickedItem = $scope.items[$index];
	    $mdBottomSheet.hide(clickedItem);
	  };*/
	};         
          
          
  function DialogController($scope, $mdDialog) {
	  
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
   }
})();