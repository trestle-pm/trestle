angular.module('GitKan.board')

.controller( 'BoardCtrl', function($stateParams, $location, gh) {
   var me = this;

   console.log('Showing details for:', $stateParams.owner, $stateParams.repo);

   this.repo = $stateParams.repo;
   this.owner = $stateParams.owner;

   this.setConfiguration = function(conf) {
      this.config = conf;
   };

   // Precompute the composite repo name
   this.repoFullName = null;
   if (this.repo) {
      this.repoFullName = [this.owner, this.repo].join('/');
   }

   // Expose repo details so we can use them in the markup
   this.repoDetails = {
      owner : $stateParams.owner,
      repo  : $stateParams.repo
   };

   // XXX: Should config live somewhere else like in a service that we can get access
   //      to through DI or something?

   if ($stateParams.repo) {
      // xxx: timing bug required this for now.
      me.setConfiguration({
         "columns": ["In Progress", "Review", "CI", "Ship"]
      });

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
            console.log('Found config: setting:', conf);
            me.setConfiguration(conf);

         }, function() {
            console.warn('This repository does not have a configuration file.');
            me.setConfiguration({});
         });
   }
})

;
