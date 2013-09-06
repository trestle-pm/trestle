/**
 Goals:
  - allow a controller to be created
  - allow the scope to be controlled by the controller
  - do not expose the entire controller to the template
  - allow the template to name the scope (provide identifier for the values)
 */

function getScope($scope, scopeName) {
   var scope = $scope;
   if (scopeName) {
      scope = scope[scopeName] = (scope[scopeName] || {});
   }

   // Remove the init so that it can only be called once
   delete $scope.init;

   return scope;
}

/**
 * options:
 *    labelName: The string for the label for this column or undefined.
 *    isBacklog: If true, this this should get all items that are not labeled
 *               with a column.
 */
function IssueColumnCtrl($scope, name, gh, options) {
   this.gh = gh;
   this._boardCtrl = options.boardCtrl;

   // From this point on we use `this.scope` to set values on the ui.
   // this.$scope is stored so that we can access the Scope's methods, ie `$watch`
   this.$scope = $scope;
   this.scope = getScope($scope, name);

   this.scope.issues     = [];
   this.scope.isBacklog  = !!options.isBacklog;
   this.scope.labelName  = options.labelName;
}

_.extend(IssueColumnCtrl.prototype, {
   updateIssueList: function() {
      this.gh.listRepoIssues(this._boardCtrl.owner, this._boardCtrl.repo,
                             (this.scope.isBacklog ? {} : {labels: this.scope.labelName}))
         .then(angular.bind(this, this._onIssuesUpdated));
   },

   _onIssuesUpdated: function(issues) {
      // If backlog:
      // - filter out all issues that have labels in a column
      var column_tags = this._boardCtrl.config.columns;

      if(this.scope.isBacklog) {
         issues = _.reject(issues, function(issue) {
            var issue_labels = _.pluck(issue.labels, 'name');
            return _.intersection(column_tags, issue_labels).length > 0;
         });
      }

      this.scope.issues = issues;
   }
});


angular.module('GitKan.board')

.controller('IssueColumn', ['$scope', 'gh', function($scope, gh) {
   // Create a controller for this scope
   // - Potentially this could be multiple controllers or no controller at all
   //   if all that is manipulated is the `model` for the template.
   var ctrl;

   // Allow the controller to be created
   $scope.init = function(scopeName, options) {
      ctrl = new IssueColumnCtrl($scope, scopeName, gh, options);
      ctrl.updateIssueList();
   };

   //{ Expose certain functionality to the template
   $scope.excludeColLabel = function(ghLabel) {
      return ghLabel.name !== ctrl.scope.labelName;
   };

   $scope.sortableOptions = function() {
      return {
         // Handle reorders
         update: function() {
            console.log(ctrl.scope.labelName, ctrl.scope.issues);
         },
         // Allow dragging between the columns
         connectWith: '.column-body',

         helper: 'clone',
         opacity: 0.8
      };
   };
   //}

}]);
