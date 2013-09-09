var mod = angular.module('Trestle.issue', []);

mod.controller('IssueCtrl', function($scope, $dialog) {
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
         var me = this;
         var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: "board/issue_details/issue_details.tpl.html",

            controller: 'IssueDetailsCtrl'
         };

         var d = $dialog.dialog(angular.extend(opts, {resolve: {
            issue: function() {return angular.copy(me.issue);}
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
         // XXX: This should allow access in the template but is not for some reason
         //      need to figure this out and make better.
         issue: '=issue'
      }
   };
});

