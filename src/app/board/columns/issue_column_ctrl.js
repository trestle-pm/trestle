angular.module('GitKan.board')

.controller('IssueColumnCtrl', function($scope, $stateParams, gh) {
   // Make sure the issues array exists all the time so that we can drag items
   // from one column into this even if there are not issues for the column.
   $scope.issues = [];

   $scope.init = function(labelName) {
      $scope.labelName = labelName;

      gh.listRepoIssues($stateParams.owner, $stateParams.repo, {labels: labelName})
         .then(function(issues) {
            $scope.issues = issues;
         });
   };

   $scope.excludeColLabel = function(ghLabel) {
      return ghLabel.name != $scope.labelName;
   };

   $scope.$watch('issues', function(newIssues, oldIssues) {
      console.log(newIssues, oldIssues);
   }, true);

   $scope.sortableOptions = {
      // Handle reorders
      update: function() {
         console.log($scope.labelName, $scope.issues);
      },
      // Allow dragging between the columns
      connectWith: '.column-body',

      helper: 'clone',
      opacity: 0.8
   };

});
