angular.module('GitKan.board')

.controller('IssueColumnCtrl', function($scope, $stateParams, gh) {
   // Make sure the issues array exists all the time so that we can drag items
   // from one column into this even if there are not issues for the column.
   $scope.issues = [];

   /**
   * options:
   *    labelName: The string for the label for this column or undefined.
   *    isBacklog: If true, this this should get all items that are not labeled
   *                with a column.
   */
   $scope.init = function(options) {
      $scope.labelName = options.labelName;
      $scope.isBacklog = !!options.isBacklog;
      $scope.columnName = ($scope.isBacklog ? 'Backlog' : $scope.labelName);

      $scope.$id = "ColumnCtrl_" + $scope.columnName + $scope.$id;

      gh.listRepoIssues($stateParams.owner, $stateParams.repo,
                        ($scope.isBacklog ? {} : {labels: $scope.labelName}))
         .then(function(issues) {
            // If backlog:
            // - filter out all issues that have labels in a column
            var column_tags = $scope.config.columns;   // all the tags used for kanban columns
            if($scope.isBacklog) {
               issues = _.reject(issues, function(issue) {
                  var issue_labels = _.pluck(issue.labels, 'name');
                  return _.intersection(column_tags, issue_labels).length > 0;
               });
            }

            $scope.issues = issues;
         });
   };

   $scope.excludeColLabel = function(ghLabel) {
      return ghLabel.name != $scope.labelName;
   };

   $scope.$watch('issues', function(newIssues, oldIssues) {
      console.log("ISSUES: Column: " + $scope.columnName , newIssues, oldIssues);
   }, true);

   $scope.sortableOptions = {
      // Handle reorders
      update: function() {
         console.log($scope.columnName, $scope.issues);
      },
      // Allow dragging between the columns
      connectWith: '.column-body',

      helper: 'clone',
      opacity: 0.8
   };

});