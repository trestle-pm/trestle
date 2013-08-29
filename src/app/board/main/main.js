angular.module('GitKan.board')

.controller( 'BoardCtrl', function($scope, $stateParams, $location, gh) {
   console.log('Showing details for:', $stateParams.owner, $stateParams.repo);

   var ctrl = this;

   function setConfiguration(conf) {
      $scope.config = conf;
   }

   if ($stateParams.repo) {
      // Grab the configuration file for this repo so that we know
      // the column names
      gh.searchIssues({title: 'OCTOBOARD_CONFIG'})
         .then(function(configIssues) {
            // Filter the search results to only only this repo since the API does
            // not allow that.
            var matcher = new RegExp($stateParams.owner + '\/' + $stateParams.repo);
            var config_issue = _.findWhere(configIssues.items, function(issue) {
               return matcher.test(issue.url);
            });

            // Try and parse the issues body as the configuration blob
            var conf = {};
            try {
               conf = JSON.parse(config_issue.body);
            } catch (err) {
               console.error('Invalid JSON for configuration issues body');
            }

            // Update the view with the configuration
            setConfiguration(conf);

         }, function() {
            console.warn('This repository does not have a configuration file.');
            setConfiguration({});
         });
   }
})

;
