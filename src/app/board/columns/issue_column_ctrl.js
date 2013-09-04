angular.module('GitKan.board')

.controller('IssueColumnCtrl', function(gh) {
   var me = this;

   // Make sure the issues array exists all the time so that we can drag items
   // from one column into this even if there are not issues for the column.
   this.issues = [];

   this.init = function(labelName, owner, repo) {
      this.labelName = labelName;

      gh.listRepoIssues(owner, repo, {labels: labelName})
         .then(function(issues) {
            me.issues = issues;
         });
   };

   this.excludeColLabel = function(ghLabel) {
      return ghLabel.name != this.labelName;
   };

   this.sortableOptions = {
      // Handle reorders
      update: function() {
         console.log(me.labelName, me.issues);
      },
      // Allow dragging between the columns
      connectWith: '.column-body',

      helper: 'clone',
      opacity: 0.8
   };

});
