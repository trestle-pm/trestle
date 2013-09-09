var mod = angular.module('Trestle.issue', []);

mod.controller('IssueCtrl', function($scope, $modal, $rootScope) {
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
         // Create a local scope for the template and add the issue into it
         var modal_scope = $rootScope.$new();

         modal_scope.issue = this.issue;

         var opts = {
            scope        : modal_scope,
            windowClass  : 'issue_details_modal',
            backdrop     : true,
            keyboard     : true,
            templateUrl  : "board/issue_details/issue_details.tpl.html"
         };

         $modal.open(opts);
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

