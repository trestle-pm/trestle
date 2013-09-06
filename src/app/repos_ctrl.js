angular.module('Trestle')

.controller( 'ReposCtrl', function($scope, $stateParams, $location, trReposSrv) {
   $scope.$id = "ResposCtrl_" + $scope.$id;

   // Graft services onto scope
   $scope.trReposSrv = trReposSrv;

   this.init = function() {
      // Update configuration for repository service
      // Reload repository service (if needed)
   };
})

;
