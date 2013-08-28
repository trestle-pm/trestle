angular.module('GitKan.board')

.controller( 'BoardCtrl', function($scope, $stateParams, $location, gh) {
   console.log('Showing details for:', $stateParams.owner, $stateParams.repo);

})

;
