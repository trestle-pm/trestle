angular.module('GitKan.board')

.controller('IssueColumnCtrl', function($scope, $stateParams, gh) {
   // Make sure the issues array exists all the time so that we can drag items
   // from one column into this even if there are not issues for the column.
   $scope.issues = [];

   /**
   * labelName: The string for the label for this column or undefined.
   * isBacklog: If true, this this should get all items that are not labeled
   *                with a column.
   */
   $scope.init = function(labelName, isBacklog) {
      $scope.labelName = labelName;
      $scope.isBacklog = !!isBacklog;

      /*
      gh.listRepoIssues($stateParams.owner, $stateParams.repo,
                        ($scope.isBacklog ? {} : {labels: labelName}))
         .then(function(issues) {
            if($scope.isBacklog) {
               // filter out all issues that have labels in a column
               var column_tags = $scope.config.columns;
               issues = _.reject(issues, function(issue) {
                                    return _.intersection(column_tags, issue.labels).length() > 0;
                                 });
            }

            $scope.issues = issues;
         });
      */
      gh.listRepoIssues($stateParams.owner, $stateParams.repo, {labels: labelName})
         .then(function(issues) {
            $scope.issues = issues;
         });
   };

   $scope.excludeColLabel = function(ghLabel) {
      return ghLabel.name != $scope.labelName;
   };

   $scope.$watch('issues', function(newIssues, oldIssues) {
      console.log("ISSUES: Column: " + $scope.labelName , newIssues, oldIssues);
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