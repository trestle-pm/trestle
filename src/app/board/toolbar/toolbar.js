angular.module('GitKan.board')

.controller('ToolbarCtrl', function($scope, $location, $stateParams, $dialog, gh) {
   // Expose the routing params
   $scope.owner = $stateParams.owner;
   $scope.repo  = $stateParams.repo;

   // Precompute the composite repo name
   $scope.repoFullName = null;
   if ($scope.repo) {
      $scope.repoFullName = [$scope.owner, $scope.repo].join('/');
   }

   gh.listAllRepos($stateParams.owner, $stateParams.repo).then(function(allRepos) {
      // Build up a tree of the issues to make things easier to search through
      $scope.allRepos = _.groupBy(allRepos, function(repo) {
         return repo.owner.login;
      });
   });

   $scope.onSwitchToRepo = function (repo) {
      $location.path('/board/'+repo.full_name);
   };

});
