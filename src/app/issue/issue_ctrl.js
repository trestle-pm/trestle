mod = angular.module('GitKan.issue', []);

mod.controller('IssueCtrl', function($scope) {
   // init
   $scope.$id = "IssueCtrl_" + $scope.$id;

   _.extend(this, {
      init: function(issue) {
         this.issue = issue;
      },

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

   this.init($scope.$parent.issue);
});

mod.directive('trIssueCard', function() {
   return {
      restrict: 'EA',
      replace: true,
      templateUrl: "issue/issue.tpl.html",
      scope: {
         issue: '=issue'   // XXX: should allow object but seems to fail
      }
   };
});

