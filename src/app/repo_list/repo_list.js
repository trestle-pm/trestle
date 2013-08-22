// Add our module to the namespace
angular.module( 'GitKan.repo_list', [
  'ui.state'
])

// Add our routes so that we can get into the section of the app
.config(function config( $stateProvider ) {
  $stateProvider.state( 'repos', {
    url: '/repos',
     controller: 'RepoListCtrl',
     templateUrl: 'repo_list/repo_list.tpl.html'
  });
})

.controller( 'RepoListCtrl', function($scope, gh) {
   gh.listAllRepos().then(function(repos) {
      // XXX Look at grabbing each repos collaboartors
      $scope.userRepos = repos;
   });
})

;
