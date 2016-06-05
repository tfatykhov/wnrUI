(function(){
	angular.module('WnrUIApp').service('utils', utils);
    utils.$inject = ['$mdDialog', '$rootScope'];
    function utils($mdDialog,  $rootScope){ 
     
     return {
       hideWait: hideWait,
       showWait: showWait
     }
            
     function hideWait(){
          setTimeout(function(){
                   $rootScope.$emit("hide_wait"); 
                },5);
      }
      
     function showWait(){
              $mdDialog.show({
                controller: 'waitCtrl',
                template: '<md-dialog id="plz_wait" style="background-color:transparent;box-shadow:none;overflow:hidden;">' +
                            '<div layout="row" layout-sm="column" layout-align="center center" aria-label="wait">' +
                                '<md-progress-circular class="md-accent md-hue-2" md-mode="indeterminate" md-diameter="96"></md-progress-circular>' +
                            '</div>' +
                         '</md-dialog>',
                parent: angular.element(document.body),
                clickOutsideToClose:false,
                fullscreen: false
              })
              .then(function(answer) {
                
              });
       }
    }
})();