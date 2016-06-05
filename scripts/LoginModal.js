(function () {

   angular.module('WnrUIApp').controller('LoginModalCtrl',LoginModalCtrl) {
      LoginModalCtrl.$inject = ['$mdDialog', '$rootScope'];
     function LoginModalCtrl($rootScope,$mdDialog)
      cancel = $mdDialog.cancel();
      submit = function (uid, pwd) {
    //        UsersApi.login(email, password).then(function (user) {
              $mdDialog.cancel()
              return uid;
          
    //        });
      };               
     });
})();    