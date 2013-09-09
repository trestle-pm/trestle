angular.module('Trestle.board')

.controller('ToolbarCtrl', function($location, $stateParams, $dialog, gh) {
   var me = this;

   gh.listAllRepos($stateParams.owner, $stateParams.repo).then(function(allRepos) {
      // Build up a tree of the issues to make things easier to search through
      me.allRepos = _.groupBy(allRepos, function(repo) {
         return repo.owner.login;
      });
   });

   this.onSwitchToRepo = function (repo) {
      console.log('switch to repo: ' + repo.full_name);
      $location.path('/repo/' + repo.full_name + '/board');
   };

});
