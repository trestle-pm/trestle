angular.module('GitKan.board')

.controller('UsersListCtrl', function($scope, $stateParams, gh) {
   gh.listRepoUsers($stateParams.owner, $stateParams.repo)
      .then(function(users) {
         $scope.users = users;
      });
})

;
