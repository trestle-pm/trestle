angular.module('Trestle')

.service('trIssueFilters', function($rootScope) {
   var scope = $rootScope.$new();

   scope.searchText = '';

   return scope;
})

.filter('globalIssueFilter', function(trIssueFilters) {
   function issue_search_text(issue) {
      return [issue.title, issue.body].join(' ').toLowerCase();
   }

   return function(issues) {
      if (trIssueFilters.searchText) {
         issues = _.filter(issues, function(issue) {
            return _.contains(issue_search_text(issue), trIssueFilters.searchText);
         });
      }

      return issues;
   };
})

.controller('IssueFilterCtrl', function() {

})

;
