// controller for image upload and local caching of links
(function () {

    'use strict';

	angular.module('WnrUIApp').controller('UploadController',['$scope','$localStorage',  'CurrForm',UploadController]);
	
	function UploadController($scope, $localStorage, CurrForm){
		
		$scope.saveme = function(flow,path)
		{ 
			var apprId = CurrForm.getForm('apprId');
			var localPath='/tp/image/'+apprId+path;
			$scope.$parent.fc.$setTouched();
			$scope.$parent.options.value('OK');			
			$scope.$storage=$localStorage;			
		    angular.forEach(flow.files, function (fl) {    	
		    	if ('localForms' in $scope.$storage){
		    	    var idx=CurrForm.searchLocalStorage($scope.$storage,apprId);
		    	    if (idx!==-1) {
		    	    	if(!('images' in $scope.$storage.localForms[idx])) $scope.$storage.localForms[idx].images={};
		    	    	$scope.$storage.localForms[idx].images[path]=localPath;
		    	    	CurrForm.pushFormChild('images',path,localPath);
		    	    }
		    	}
		    });
		}
		
		$scope.uploadme= function (flow,path)
		{
			$scope.$storage=$localStorage;
			var apprId = CurrForm.getForm('apprId');
			var fullPath='/'+apprId+path;
			var localPath='/tp/image/'+apprId+path;
		    angular.forEach(flow.files, function (fl) {
		    	fl.path=fullPath;
		    });
		    flow.upload();
		}
		$scope.getImage = function(path){
			$scope.$storage=$localStorage;
			var s=$scope.$storage;
			var apprId = CurrForm.getForm('apprId');
			var defImg = 'images/default_pic.jpg';
	    	if ('localForms' in $scope.$storage){
	    	    var idx=CurrForm.searchLocalStorage(s,apprId);
	    	    if (idx!==-1 && 'images' in s.localForms[idx]) {
	    	    	defImg = (typeof s.localForms[idx].images[path] !== 'undefined' ? s.localForms[idx].images[path] : defImg);
	    	    }
		  }
	    return defImg;
		}
	}
})();