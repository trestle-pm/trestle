angular.module('Trestle.board')

.controller( 'IssueDetailsCtrl', function() {
   this.init = function(issue) {
      console.log('init', issue);
      this.issue = issue;
   };
})

;
