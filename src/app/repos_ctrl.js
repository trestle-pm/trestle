angular.module('Trestle')

.controller( 'ReposCtrl', function($scope, $stateParams, $location, trReposSrv) {
   $scope.$id = "ResposCtrl_" + $scope.$id;

   // Expose the repo services shared data
   $scope.trReposSrv = trReposSrv.$scope;

   this.init = function() {
      // Update configuration for repository service
      // Reload repository service (if needed)
   };
})

;
