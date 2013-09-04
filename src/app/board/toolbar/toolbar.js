angular.module('GitKan.board')

.controller('ToolbarCtrl', function($location, $stateParams, $dialog, gh) {
   var me = this;

   gh.listAllRepos($stateParams.owner, $stateParams.repo).then(function(allRepos) {
      console.log(allRepos);
      // Build up a tree of the issues to make things easier to search through
      me.allRepos = _.groupBy(allRepos, function(repo) {
         return repo.owner.login;
      });
   });

   this.onSwitchToRepo = function (repo) {
      $location.path('/board/'+repo.full_name);
   };

});
