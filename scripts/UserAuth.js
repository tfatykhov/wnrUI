(function(){

    'use strict';

    angular
        .module('WnrUIApp')
        .factory('UserAuth', UserAuth);
    
     function UserAuth($rootScope,$http,$interval) {
         
        var login=function(uid,pwd,browserUid){
            var req = {
                cache : false,
                method: 'POST',
                url: '/auth',
                data : {
                    uid: uid,
                    pwd: btoa(pwd),
                    uuid:btoa(browserUid)
                }
            }
            return $http(req)
                .then(function(response){ console.log('login was executed from '+req.url);
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