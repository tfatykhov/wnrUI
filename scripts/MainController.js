// Main application controller. Data init.Functions for menus and form validation, etc.
(function () {

    'use strict';

    angular.module('WnrUIApp')
        .controller('MainController', ['$scope', '$http', '$timeout', '$mdSidenav', '$localStorage', '$mdDialog', '$mdMedia', '$state', 'province', 'HomeComponents', 'ApprForm', 'CurrForm', 'NgMap', MainController])
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
    
function MainController($scope, $http, $timeout, $mdSidenav, $localStorage, $mdDialog, $mdMedia,  $state, province, HomeComponents, ApprForm,CurrForm,NgMap) {

    var vm = this;
    var originatorEv;
	$scope.geoStat='NOK';
    vm.menuItems=[];
 	$scope.storage=$localStorage;
    vm.onSubmit = onSubmit;
    vm.DialogController = DialogController;
    vm.toggleItemsList = toggleItemsList;
    vm.selectItem = selectItem;
     
    $scope.init = function () {
   	
    	vm.menuItems = [
    	                {
    	                  name: 'Home Status',
    	                  icon: 'home',
    	                  sref: 'list'
    	                },
    	                {
    	                  name: 'Controls',
    	                  icon: 'donut_small',
    	                  sref: 'conrtols'
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
    	$scope.vm.userId='s6utyf'; 
        ApprForm.getMainForm('/tp/form/MainForm',$scope.storage).then(function(ApprResponse){
            $scope.vm.form= ApprForm.getLocalFormDef($scope.storage);
        });
        vm.property ={};
        $scope.form_progress = 0;
        vm.title = vm.menuItems[0].name;  
        $scope.form_progress=0;
        $scope.form = vm.property;
        $scope.vm.createdBy='s6utyf'; 
        $scope.vm.frontImage='/front/1';
    };
    $scope.init();
    
    this.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };
    //loading properties from local storage or remote storage
    $scope.getProps = function(){
    	ApprForm.getPropList($scope.vm.userId,$scope.storage)
    	 .then(function(res){
    		 $scope.vm.propertyList=res;
    	    	console.log('got properties:');
    	    	console.log($scope.vm.propertyList);
    	 });
    		//ApprForm.getLocalPropList($scope.storage);
    };
    
    $scope.getCams = function(){
        HomeComponents.getCameras()
        .then(function(res){
            $scope.vm.cameras=res.cameras;
            console.log('got cameras:');
            console.log($scope.vm.cameras);
        })
    }
    
    
    $scope.validateForm = function (){
        if ('propertyForm' in $scope.vm && '$invalid' in $scope.vm.propertyForm && $scope.vm.propertyForm.$invalid) {
            
            angular.forEach( $scope.vm.propertyForm.$error, function (field) {
              angular.forEach(field, function(errorField){
                errorField.$setTouched();
              })
            });
        }    	
    };
    
    //loading form from local storage
    $scope.loadForm = function(apprId){
   	if (typeof CurrForm.getForm('apprId')!=='undefined' && typeof CurrForm.getForm('formData')!=='undefined' &&  'str_addr' in CurrForm.getForm('formData')){
    		CurrForm.saveLocal($scope.storage,vm.property);
    	}
		CurrForm.reset();    	
    	CurrForm.setForm('apprId',apprId);
    	console.log('opened form, id:'+CurrForm.getForm('apprId'));
    	CurrForm.loadFromLocal($scope.storage,function(){
	    	vm.property=CurrForm.getForm('formData');
	    	$scope.form_progress=CurrForm.getForm('progress');
	    	$scope.formId=CurrForm.getForm('formId');
	    	$scope.formStatus=CurrForm.getForm('status');
	    	$scope.form = vm.property;
	    	$scope.geoStat=CurrForm.getForm('geoStat');
	    	vm.title=vm.property.str_addr;
	    	vm.progress=$scope.form_progress;	    	
    	});
    };
    //initiates new form
    $scope.startNewForm = function(){
    	if (typeof CurrForm.getForm('apprId')!=='undefined' && typeof CurrForm.getForm('formData')!=='undefined' &&  'str_addr' in CurrForm.getForm('formData')){
    		CurrForm.saveLocal($scope.storage,vm.property);
    	}
		CurrForm.reset();
    	vm.property = {};
    	$scope.geoStat="NOK"
    	CurrForm.setForm('apprId',CurrForm.guid());
    	CurrForm.setForm('formId',$scope.vm.form.formId);
    	CurrForm.setForm('createdBy',$scope.vm.createdBy);
    	CurrForm.setForm('status','in progress');
    	CurrForm.setForm('geoStat',$scope.geoStat);
       	CurrForm.setForm('upi',"");   	
    	console.log('started new form, id:'+CurrForm.getForm('apprId'));
    	$scope.form = vm.property;
    	$scope.form_progress = 1;
    	$scope.formId = vm.form.id;
    	vm.title='Add new property';
       	//vm.showAddrPrompt();
    };
       
    //watching on form changes
    $scope.$watch('form', function(newVal,oldVal){
    	//form_progress = CurrForm.getForm('progress') || 0;
    	$scope.storage=$localStorage;
        var total=0;
        var cmp=0;
    	$scope.validateForm();        
        if (newVal!==oldVal){
	        for(var f in $scope.vm.propertyForm){
	             if(f.indexOf('vm.')!=-1){
	             var field = $scope.vm.propertyForm[f];
	            	 total++;
	            	 if (field.$valid && (field.$modelValue===field.$modelValue)) cmp++;
	             }
	        }
	        if (total>0) {
	        	if (($scope.geoStat==="NOK" || typeof $scope.geoStat==='undefined') && CurrForm.haveAddress()) {
	        		CurrForm.geocodeAddrress().then(function(res){
	        			if (res.status=="200" && res.data.street!=="" && res.data.lat!=="null"){
	        				vm.property.str_addr=res.data.street;
	        			    vm.property.city=res.data.city;
	        			    vm.property.zip=res.data.zip;
	        			    vm.property.state=res.data.state;
	        			    vm.property.lat=res.data.lat;
	        			    vm.property.lng=res.data.lng;
	        			    $scope.geoStat='OK';
	        			    CurrForm.setForm('geoStat',$scope.geoStat);
	        			}
	        		});
	        	}
	        	$scope.form_progress=(cmp>0 ? cmp*100/total : 0);
	        	vm.progress=$scope.form_progress;
	            CurrForm.setForm('progress',$scope.form_progress);
	            if ($scope.form_progress==100){
	            	console.log($scope.form_progress);
	            	CurrForm.setForm('status','complete');
	            }
	        }
        }
        if (newVal!==oldVal && 'str_addr' in newVal) {
        	CurrForm.saveLocal($scope.storage,vm.property);
        	if ($scope.geoStat='OK') {        
        		$timeout(function() {
            	CurrForm.saveRemote('/tp/form/apprsl/'+$scope.vm.userId+'/'+CurrForm.getForm('apprId'),JSON.stringify(CurrForm.loadFromLocal($scope.storage)));   
            }, 0);
        	}
        }
    }, true);
    // TODO add function to reset status when address changes
    //on form submit placeholder for now
    

    function onSubmit() {
        $timeout(function() {
        	CurrForm.saveRemote('/tp/form/apprsl/'+$scope.vm.userId+'/'+CurrForm.getForm('apprId'),JSON.stringify(CurrForm.loadFromLocal($scope.storage)));   
          }, 0);
    };
    
    
    function toggleItemsList() { 
        $mdSidenav('left').toggle();
    };
    
    
    function selectItem (item) {
      vm.title = item.name;
      vm.toggleItemsList();
    };
    
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