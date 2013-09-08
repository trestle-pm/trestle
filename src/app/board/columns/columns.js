angular.module('Trestle.board')

/**
 @ngdoc service
 @name Trestle.board.issueHelpers

 @description
 Simple service to hold methods helpful to working with issues.

 XXX this could be moved to the Restangular stub
 */
.service('issueHelpers', function() {
   this.getIssueLabels = function(issue) {
      return _.map(issue.labels, function(labelObj) {
         return labelObj.name;
      });
   };
})

/**
 @ngdoc filter
 @name  Trestle.board.issuesWithLabel

 @description
 Takes an array of GitHub issues and filters it down to only issues with the
 specified labelName

 @param {String} labelName The textual name of a label all issues must have to
        be returned by this filter.
 @returns {Array} Set of issues with the label
 */
.filter('issuesWithLabel', function(issueHelpers) {
   return function(issues, labelName) {
      if (!labelName) { throw new Error('labelName must be set'); }

      return _.filter(issues, function(issue) {
         return _.contains(issueHelpers.getIssueLabels(issue), labelName);
      });
   };
})

/**
 @ngdoc filter
 @name  Trestle.board.issuesInBacklog

 @description
 Takes an array of GitHub issues and filters it down to only issues that do not
 have a label used for a column.

 @returns {Array} Set of issues that are not part of a column
 */
.filter('issuesInBacklog', function(issueHelpers, trRepoModel) {
   return function(issues) {
      var columns = trRepoModel.config.columns;
      return _.filter(issues, function(issue) {
         return _.intersection(issueHelpers.getIssueLabels(issue), columns).length === 0;
      });
   };
})

.controller('ColumnsCtrl', function($scope, trRepoModel) {
   this.getColumnWidth = function() {
      var config      = trRepoModel.config,
          num_columns = config ? config.columns.length : 0;

      if($scope.showBacklog) {
         num_columns += 1;
      }

      return { width: (100.0 / num_columns) + '%'};
   };

})

;
