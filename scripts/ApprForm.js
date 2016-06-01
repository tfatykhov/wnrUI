(function(){

    'use strict';

    angular
        .module('WnrUIApp')
        .factory('ApprForm', ApprForm);
        	
    
            function ApprForm($http) {
                return {
                	getMainForm  : getMainForm,
                    getPropList : getPropList,
                    getLocalPropList : getLocalPropList,
                    saveLocalFormDef : saveLocalFormDef,
                    getLocalFormDef : getLocalFormDef
                };
                              	
                function getLocalPropList(storage){
                	var frmList=[];
                	if('localForms' in storage){
                		angular.forEach(storage.localForms, function (form,idx) {                			
                			var prop=form.formData;
                			var frnt_img="images/house.jpg";
                			if ('images' in form && '/front/1' in form.images) frnt_img=form.images['/front/1'];
                			frmList.push({
                				"apprId":form.apprId,
                				"str_addr":prop.str_addr,
                				"city": prop.city,
                				"state": prop.state,
                				"zip": prop.zip,
                				"lat": prop.lat || 0,
                				"lng":prop.lng || 0,
                				"cond":prop.cond,
                				"qlty":prop.qlty,
                				"progress":form.progress,
                				"frnt_img":frnt_img
                			});               		                			
                		}); 
                	}
                	return frmList;
                }
                
                function getPropList(userId,storage){
                    var req = {
                    		cache : false,
                            method: 'GET',
                            url: '/tp/form/apprslist/'+userId,
                            headers :{
                                'Cache-Control': 'no-cache'
                            }
                        }
                       return $http(req).then(function(response){console.log('getPropList was executed from '+req.url);return response.data.list},function(response){console.log('url: '+req.url+' error '+JSON.stringify(response));return getLocalPropList(storage)});
               	
                };
                
                 function getMainForm(frm_url,storage) {
                    var req = {
                        method: 'GET',
                        url: frm_url,
                        headers :{
                            'Cache-Control': 'no-cache'
                        }
                    }                
                   return $http(req).then(function(response){console.log('getForm was executed from '+frm_url);saveLocalFormDef(storage,response.data); return response.data},function(response){console.log('url: '+frm_url+' error '+JSON.stringify(response));return 'error'});
                };
                 
                function saveLocalFormDef(storage,form){
                	storage.MainForm={
                			"formId" : form.id || '30387B044BD8FB91E053E16CCF0AFD59',
                			"formData":form.form
                	}
                };
                
                function getLocalFormDef(storage){
                	return storage.MainForm || {};
                };
                
             
                function defaultPropList() {
                    var prop_lst= [{"str_addr":"18718","city":"RIVERTON","state":"","zip":"06065","lat":"","lng":"","cond":"3","qlty":"4"}];
                    return prop_lst
                };
            };        
})();