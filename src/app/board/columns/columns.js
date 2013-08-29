angular.module('GitKan.board')

.controller('ColumnsCtrl', function($scope, $rootScope, $stateParams, $dialog, gh) {
   // Grab the configuration file for this repo so that we know
   // the column names
   gh.searchIssues({title: 'OCTOBOARD_CONFIG'})
      .then(function(configIssues) {
         // Filter the search results to only only this repo since the API does
         // not allow that.
         var config_issue = _.findWhere(configIssues.items, function(issue) {
            console.log(new RegExp($stateParams.owner + '\/' + $stateParams.repo).test(issue.url), $stateParams.owner + '\/' + $stateParams.repo, issue.url);
            return new RegExp($stateParams.owner + '\/' + $stateParams.repo).test(issue.url);
         });

         if (config_issue) {
            $scope.config = JSON.parse(config_issue.body);
            $scope.columns = $scope.config.columns;
         }
      }, function() {
         console.warn('This repository does not have a configuration file.');
         $scope.columns = ['Backlog', 'Review', 'CI', 'Ship'];
      });

   gh.listRepoIssues($stateParams.owner, $stateParams.repo)
      .then(function(issues) {
         $scope.allIssues = issues;
      });

   $scope.hasLabel = function(column) {
      return function(issue) {
         var labels = _.map(issue.labels, function(lbl) {
            return _.last(lbl.name.split('-')).trim();
         });
         return _.contains(labels, column);
      };
   };

   $scope.getColumnWidth = function() {
      return {width: (100.0 / $scope.columns.length) + '%'};
   };

   $scope.showIssueDetails = function(issue) {
      var opts = {
         backdrop: true,
         keyboard: true,
         backdropClick: true,
         templateUrl: "board/controllers/issue_details/issue_details.tpl.html",

         controller: 'IssueDetailsCtrl'
      };

      var selected_issue = issue;
      var d = $dialog.dialog(angular.extend(opts, {resolve: {
         issue: function() {return angular.copy(selected_issue);}
      }}));
      d.open();
   };

   /**
    Called when an issue starts being dragged so to set the mime-type/data for
    the drag event.  This data is used by other systems to determine if
    they can handle the event.

    It is good to pass as many versions of the data as possible so that we
    can interoperate with as many other systems as possible.
    */
   $scope.onIssueDragStart = function(issue, $event) {
      // The three common ways to passing urls
      // Ideally, this will allow us to interoperate with other systems.
      var mime_data = {
         'URL':           issue.html_url,
         'text/uri-list': issue.html_url,
         'text/plain':    issue.html_url
      };

      // Add the types to the event so that they follow through the
      // dragenter and drop events.
      _.map(mime_data, function(value, type) {
         $event.dataTransfer.setData(type, value);
      });
   };

   /**
    Called when a drag is over a column.  The goal is to check the mime-type/data
    for the drag event and return if the column can handle the data.

    The column can handle the following URLS:
     * issue urls
     * pull urls

    URLs can be stored in the drag data as any of the following types:
    @see
     * URL
     * text/uri-list
     * text/plain
    */
   $scope.canHandleDrop = function($event) {
      // See if there is a github URL
      var url = _.find(['URL', 'text/uri-list', 'text/plain'], function(mimeType) {
         var data = $event.dataTransfer.getData(mimeType);
         var grabber = /https?:\/\/github\.com\/(.*)\/(.*)\/(pull|issues)\/([0-9]{1,5})/;

         var matches = grabber.exec(data);
         if (matches) {
            var owner  = matches[1],
                repo   = matches[2];

            if (owner === $stateParams.owner && repo === $stateParams.repo) {
               return data;
            }
         }

         return false;
      });

      return url ? true : false;
   };

   $scope.onDrop = function() {
      console.log('drop');
   };
})

;
