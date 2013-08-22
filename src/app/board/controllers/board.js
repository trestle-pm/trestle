angular.module('GitKan.board')

.controller( 'BoardCtrl', function($scope, $stateParams) {
   console.log('Showing details for:', $stateParams.owner, $stateParams.repo);
})

;
