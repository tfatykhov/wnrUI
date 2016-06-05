(function(){

    'use strict';

    angular
        .module('WnrUIApp')
        .factory('UserAuth', UserAuth);
    
     function UserAuth($rootScope,$http,$interval) {
         
        var login=function(uid,pwd){
            var req = {
                cache : false,
                method: 'POST',
                url: '/auth',
                data : {
                    uid: uid,
                    pwd: pwd
                }
            }
            return $http(req)
                .then(function(response){ console.log('getLightts was executed from '+req.url);
                return response;
                },
                function(response){console.log('url: '+req.url+' error '+JSON.stringify(response));return 'eror'});                    
        };

         
         var methods = {
             login : login
         }
         return methods;         
     }           
})();        