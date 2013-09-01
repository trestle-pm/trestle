angular.module('GitKan.board')

.controller('IssueColumnCtrl', function($scope, $stateParams, gh) {
   // Make sure the issues array exists all the time so that we can drag items
   // from one column into this even if there are not issues for the column.
   var me = this;

   /* XXX: Q: Should we initialize everything to defaults here or just wait for init?
   this.labelName  = "";
   this.isBacklog  = false;
   this.columnName = "";
   this.issues = [];
   */

   $scope.$watch('colCtrl.issues', function(newIssues, oldIssues) {
      console.log("ISSUES: Column: " + me.columnName, newIssues, oldIssues);
   }, true);

   _.extend(this, {
      /**
      * options:
      *    labelName: The string for the label for this column or undefined.
      *    isBacklog: If true, this this should get all items that are not labeled
      *                with a column.
      */
      init: function(options) {
         var me = this;

         this.issues     = [];
         this.labelName  = options.labelName;
         this.isBacklog  = !!options.isBacklog;
         this.columnName = (this.isBacklog ? 'Backlog' : this.labelName);

         $scope.$id = "ColumnCtrl_" + this.columnName + $scope.$id;

         gh.listRepoIssues($stateParams.owner, $stateParams.repo,
                           (this.isBacklog ? {} : {labels: this.labelName}))
            .then(function(issues) {
               // If backlog:
               // - filter out all issues that have labels in a column
               var column_tags = $scope.config.columns;
               if(me.isBacklog) {
                  issues = _.reject(issues, function(issue) {
                     var issue_labels = _.pluck(issue.labels, 'name');
                     return _.intersection(column_tags, issue_labels).length > 0;
                  });
               }

               me.issues = issues;
            });
      },

      excludeColLabel: function(ghLabel) {
         return ghLabel.name != this.labelName;
      },

      sortableOptions: {
         // Handle reorders
         update: function() {
            console.log(me.columnName, me.issues);
         },
         // Allow dragging between the columns
         connectWith: '.column-body',

         helper: 'clone',
         opacity: 0.8
      }

   });


});