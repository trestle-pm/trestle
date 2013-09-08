angular.module('Trestle')

.controller( 'ReposCtrl', function($scope, $stateParams, $location, trRepoModel) {
   $scope.$id = "ResposCtrl_" + $scope.$id;

   this.init = function(options) {
      options = options || {};

      // Put the repo model into the scope so that templates can access it
      $scope[options.repoModelName || 'repoModel'] = trRepoModel;

      // Update configuration for repository service
      // Reload repository service (if needed)
   };
})

;
