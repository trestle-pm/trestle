mod = angular.module('GitKan.board');

mod.controller('IssueColumnCtrl', function($scope, $stateParams, gh) {
   // XXX: Would it make sense to make a true class/object for this controller?

   // Make sure the issues array exists all the time so that we can drag items
   // from one column into this even if there are not issues for the column.
   $scope.issues = [];

   $scope.init = function(labelName) {
      $scope.labelName = labelName;

      gh.listRepoIssues($stateParams.owner, $stateParams.repo, {labels: labelName})
         .then(function(issues) {
            $scope.issues = issues;
         });
   };

   $scope.excludeColLabel = function(ghLabel) {
      return ghLabel.name != $scope.labelName;
   };

   $scope.$watch('issues', function(newIssues, oldIssues) {
      console.log("ISSUES: Column: " + $scope.labelName , newIssues, oldIssues);
   }, true);

   $scope.sortableOptions = {
      // Handle reorders
      update: function() {
         console.log($scope.labelName, $scope.issues);
      },
      // Allow dragging between the columns
      connectWith: '.column-body',

      helper: 'clone',
      opacity: 0.8
   };

});

/*
mod.controller('IssueCtrl', function($scope) {
   console.log('blah');

   $scope.$id = "IssueCtrl_" + $scope.$id;

   $scope.isPullRequest = function() {
      var issue = $scope.issue;
      return issue.pull_request && _.isString(issue.pull_request.html_url);
   };

   $scope.getAssignedUser = function() {
      return $scope.issue.assignee;
   };

   $scope.showIssueDetails = function(issue) {
      var opts = {
         backdrop: true,
         keyboard: true,
         backdropClick: true,
         templateUrl: "board/issue_details/issue_details.tpl.html",

         controller: 'IssueDetailsCtrl'
      };

      var selected_issue = issue;
      var d = $dialog.dialog(angular.extend(opts, {resolve: {
         issue: function() {return angular.copy(selected_issue);}
      }}));
      d.open();
   };
});
*/

/** Option 2: Construct local object each time */
/*
mod.controller('IssueCtrl', function($scope) {

   // I would kind of like to get rid of the scope altogether, maybe...
   this.issue = $scope.issue;

   // Define methods on the object.
   angular.extend(this, {
      isPullRequest: function() {
         return this.issue.pull_request && this.issue.pull_request.html_url;
      },

      getAssignedUser: function() {
         return this.issue.assignee;
      },

      showIssueDetails: function() {
         var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: "board/issue_details/issue_details.tpl.html",

            controller: 'IssueDetailsCtrl'
         };

         var selected_issue = issue;
         var d = $dialog.dialog(angular.extend(opts, {resolve: {
            issue: function() {return angular.copy(selected_issue);}
         }}));
         d.open();
      }
   });
});
*/

/** Option 3: Separate prototype based class */

function IssueCtrl($scope) {
   this.issue = $scope.issue;
}

IssueCtrl.prototype = {
   isPullRequest: function() {
      return this.issue.pull_request && this.issue.pull_request.html_url;
   },

   getAssignedUser: function() {
      return this.issue.assignee;
   },

   showIssueDetails: function() {
      var opts = {
         backdrop: true,
         keyboard: true,
         backdropClick: true,
         templateUrl: "board/issue_details/issue_details.tpl.html",

         controller: 'IssueDetailsCtrl'
      };

      var selected_issue = issue;
      var d = $dialog.dialog(angular.extend(opts, {resolve: {
         issue: function() {return angular.copy(selected_issue);}
      }}));
      d.open();
   }
};

mod.controller('IssueCtrl', IssueCtrl);


