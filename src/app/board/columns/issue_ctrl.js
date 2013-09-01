angular.module('GitKan.board')

.controller('IssueCtrl', function($scope) {
   // init
   $scope.$id = "IssueCtrl_" + $scope.$id;
   this.issue = $scope.issue;

   _.extend(this, {
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

