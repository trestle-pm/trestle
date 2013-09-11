var mod = angular.module('Trestle.issue', []);

mod.controller('IssueCtrl', function($scope, $modal, $rootScope, trRepoModel) {
   // init

   _.extend(this, {
      init: function(issue) {
         this.issue = issue;
         $scope.$id = "IssueCtrl:" + issue.number + $scope.$id;
      },

      isPullRequest: function() {
         return this.issue.pull_request && this.issue.pull_request.html_url;
      },

      /** Return status of build.
      * - "pending", "success", "failure", "error", "unknown"
      */
      getBuildStatus: function() {
         var status = "unknown";
         if(this.issue.tr_top_build_status) {
            status = this.issue.tr_top_build_status.state;
         }
         return status;
      },

      getAssignedUser: function() {
         return this.issue.assignee;
      },

      /**
      * Return the label names for the issue.
      * by default we strip out the issue columns from this list.
      *
      *  config:
      *    - stripCols: <bool>  If true strip the column labels.
      */
      getLabels: function(config) {
         config = _.defaults({}, config, {
            stripCols: true
         });

         var col_labels = trRepoModel.config.columns;
         var labels = this.issue.labels.slice(0);

         if(config.stripCols) {
            labels = _.filter(labels, function(label) {
               return !_.contains(col_labels, label.name);
            });
         }
         return labels;
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
            templateUrl  : "issue/issue_details.tpl.html"
         };

         $modal.open(opts);
      },

      /**
      * Popup dialog to allow converting issue to pull.
      */
      convertToPull: function() {
         var modal_scope = $rootScope.$new();

         modal_scope.issue = this.issue;

         var opts = {
            scope        : modal_scope,
            windowClass  : 'convert_to_pull_modal',
            backdrop     : true,
            keyboard     : true,
            templateUrl  : "issue/convert_to_pull.tpl.html"
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

