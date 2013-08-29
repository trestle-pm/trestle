angular.module('GitKan.board')

.controller('ToolbarCtrl', function($scope, $location, $stateParams, $dialog, allRepos) {
   // Expose the routing params
   $scope.owner = $stateParams.owner;
   $scope.repo  = $stateParams.repo;

   // Precompute the composite repo name
   $scope.repoFullName = null;
   if ($scope.repo) {
      $scope.repoFullName = [$scope.owner, $scope.repo].join('/');
   }

   // Build up a tree of the issues to make things easier to search through
   $scope.allRepos = _.groupBy(allRepos, function(repo) {
      return repo.owner.login;
   });

   $scope.onSwitchToRep = function onSwitchToRep(repo) {
      $location.path('/board/'+repo.full_name);
   };
});
