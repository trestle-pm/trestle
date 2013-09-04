angular.module('GitKan.board')

.controller( 'IssueDetailsCtrl', function() {
   this.init = function(issue) {
      console.log('init', issue);
      this.issue = issue;
   };
})

;
