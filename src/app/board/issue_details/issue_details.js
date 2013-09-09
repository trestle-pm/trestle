angular.module('Trestle.board')

.controller( 'IssueDetailsCtrl', function($scope) {
   this.init = function(issue) {
      console.log('init', issue);
      this.issue = issue;
   };
})

;
