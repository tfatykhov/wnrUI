(function(){

    'use strict';

    angular
        .module('WnrUIApp')
        .factory('userAuth', userAuth);
     function userAuth($rootScope,$http,$interval) {
         
         
         
         var methods = {
             login : login
         }
         return methods;         
     }           
})();        