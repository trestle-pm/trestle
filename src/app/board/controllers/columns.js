angular.module('GitKan.board')

.controller('ColumnsCtrl', function($scope, $stateParams, gh) {
   gh.getFile($stateParams.owner, $stateParams.repo, '.huboard')
      .then(function(contents) {
         var config = JSON.parse(contents);
         $scope.columns = config.columns;
      }, function() {
         console.warn('This repository does not have a configuration file.');
         $scope.columns = ['Backlog', 'Review', 'CI', 'Ship'];
      });

   gh.listRepoIssues($stateParams.owner, $stateParams.repo)
      .then(function(issues) {
         $scope.allIssues = issues;
      });

   $scope.hasLabel = function(column) {
      return function(issue) {
         var labels = _.map(issue.labels, function(lbl) {
            return _.last(lbl.name.split('-')).trim();
         });
         return _.contains(labels, column);
      };
   };
})

;
