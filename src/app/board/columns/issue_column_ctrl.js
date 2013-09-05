/* Obviously, this would need a new home but the idea is we can expose the
   controller like the controller as syntax but have our creation be much for
   straight forward.
 */
function exposeIt(scope, Cls) {
   scope.init = function(name, options) {
      // Put the controller into the scope
      scope[name] = new Cls(options);

      // Remove the init method so that it cannot be used agian.
      delete scope.init;
   };
}


angular.module('GitKan.board')

.controller('IssueColumnCtrl', ['$scope', '$stateParams', 'gh', function($scope, $stateParams, gh) {
   /**
    * options:
    *    labelName: The string for the label for this column or undefined.
    *    isBacklog: If true, this this should get all items that are not labeled
    *               with a column.
    */
   function IssueColumnCtrl(options) {
      this.issues     = [];
      this.owner      = $stateParams.owner;
      this.repo       = $stateParams.repo;
      this.labelName  = options.labelName;
      this.isBacklog  = !!options.isBacklog;

      $scope.$id = "ColumnCtrl_" + this.labelName + $scope.$id;

      this._getIssues();
   }

   _.extend(IssueColumnCtrl.prototype, {
      _getIssues: function() {
         var me = this;
         gh.listRepoIssues(this.owner, this.repo,
                           (this.isBacklog ? {} : {labels: this.labelName}))
            .then(function(issues) {
               // If backlog:
               // - filter out all issues that have labels in a column
               var column_tags = $scope.boardCtrl.config.columns;
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
         return ghLabel.name !== this.labelName;
      },

      sortableOptions: function() {
         var me = this;
         return {

            // Handle reorders
            update: function() {
               console.log(me.labelName, me.issues);
            },
            // Allow dragging between the columns
            connectWith: '.column-body',

            helper: 'clone',
            opacity: 0.8
         };
      }

   });

   // Allow the issue column controller to be constructed.
   exposeIt($scope, IssueColumnCtrl);
}]);
