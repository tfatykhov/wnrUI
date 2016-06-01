// service factory for data sharing between controllers
(function(){

    'use strict';

    angular
    .module('WnrUIApp')
    .factory('CurrForm', CurrForm);
    
    
    function CurrForm($http) {
    	var currForm={};
        return {
        	getPropFromLocal : getPropFromLocal,
            setForm  : setForm,
            getForm : getForm,
            reset : reset,
            guid : guid,
            saveLocal : saveLocal,
            saveRemote : saveRemote,
            pushFormChild: pushFormChild,
            loadFromLocal :loadFromLocal,
            searchLocalStorage : searchLocalStorage,
            getImgAsArray : getImgAsArray,
            haveAddress : haveAddress,
            geocodeAddrress : geocodeAddrress
        };
        //generates guid
		function guid() {
		  function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
		      .toString(16)
		      .substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		};
		
		function reset(){
			currForm={}
		}
		
		//set curr form prop value
		function setForm(prop,value) {
			currForm[prop]=value;
		};
    
		//get curr form prop value
		function getForm(prop) {
			return currForm[prop];
		};
		
		//add value to child of  currForm property
		function pushFormChild(prop,child,value){
			if (!(prop in currForm)) currForm[prop]={};
			currForm[prop][child]=value;
		}
		
		function isObject (item) {
			  return (typeof item === "object" && !Array.isArray(item) && item !== null);
			}
		
		
		function getImgAsArray(storage,apprId){
			var resArray=[];
			var Img;
			if (searchLocalStorage(storage,apprId)!==-1){
				Img=getPropFromLocal(storage,'images',apprId) || [];
				 angular.forEach(Img,function(value,key){
					 this.push(value);
				 },resArray);				
			} else {
				loadRemote(apprId).then(function(res){
					Img=res.data.images || [];
					 angular.forEach(Img,function(value,key){
						 this.push(value);
					 },resArray);					
				});
			}
			return resArray;
		}
		
		function getPropFromLocal(storage,prop,apprId){
			var val='';
			var myApprId=apprId || currForm.apprId;
			if ('localForms' in storage){
			    var idx=searchLocalStorage(storage,myApprId);
			     val = (idx!==-1 ? storage.localForms[idx][prop] : '');
			     return val;
			} else return '';
		}
		
		
		function loadFromLocal(storage,callback){
			if (!('localForms' in storage)) storage.localForms=[];
			    var idx=searchLocalStorage(storage,currForm.apprId);
			    if (idx!==-1) {
			    	currForm=storage.localForms[idx];
				     if (typeof callback === "function") {
				    	 callback();
				     }
			    } else {
			    	loadRemote(currForm.apprId).then(function(res){
			    		currForm=res.data;
					     if (typeof callback === "function") {
					    	 callback();
					     }
			    	});		    	
			    }
			     return currForm;
		}
		
		
		function searchLocalStorage(storage,apprId){
			if (!('localForms' in storage)) return -1;
			var idx = storage.localForms.map(function(x){
				return x.apprId;
			}).indexOf(apprId);
			return idx;
		};
		
		function loadRemote (apprId){
            var req = {
                    method: 'GET',
                    url: '/tp/form/apprsl/'+apprId,
                    headers :{
                        'Cache-Control': 'no-cache'
                    }
                }   
	            return $http(req)
	           	.success(function(data,status,headers,config){
	           		console.log(data);
	           		console.log(status);
	           		return { "status":"OK","data":data};
	           	})
	           	.error(function(data,status,headers,config){
	           		console.log('error: '+ status);
	           		return {"status":"ERROR"};
	           	});
             };
		
		
        function saveRemote(frm_url,frm_Json) {
            var req = {
                method: 'POST',
                url: frm_url,
                headers :{
                    'Content-Type': 'application/json'
                },
                data: frm_Json
            }
            return $http(req).then(function(){console.log('saveRemote was executed from '+frm_url);return 'ok'},function(){console.log('url: '+frm_url+' unreachable');return 'error'});
        };
		
		function saveLocal(storage,frmData){
			if(typeof frmData !=='undefined'){
			currForm.formData=frmData;
			if (!('localForms' in storage)){
				storage.localForms=[];
				storage.localForms.push(currForm);
			}
			else {
				 var idx=searchLocalStorage(storage,currForm.apprId);
				 (idx!==-1 ? storage.localForms[idx]=currForm : storage.localForms.splice(0,0,currForm));
			}
		 }
		};
		function haveAddress(){
			var result = false;
			if ('formData' in currForm){
				var f = currForm.formData;
				if (('str_addr' in f && typeof f.str_addr !=='undefined') && 
						('city' in f && typeof f.city !=='undefined') &&
						('zip' in f && typeof f.zip !=='undefined'))
	
				{
					result = true;
				}
			}
			return result;
		};
				
		function geocodeAddrress(){
	//		if (haveAddress()){
				var f = currForm.formData;
				var req = {
                        method: 'POST',
                        url: '/tp/form/geocode',
                        headers :{
                            'Content-Type': 'application/json'
                        },
                        data : {
                        "street" : f.str_addr,
                        "city"	 : f.city,
                        "state"  : f.state,
                        "zip"    : f.zip
                        }
                    }                
                   return $http(req)
                   	.success(function(data,status,headers,config){
                   		console.log(data);
                   		console.log(status);
                   		return { "status":"OK","data":data};
                   	})
                   	.error(function(data,status,headers,config){
                   		console.log('error: '+ status);
                   		return {"status":"ERROR"};
                   	});                
//			} else return {"status":"ERROR"};
		}
  };    
})();    
    	
    	