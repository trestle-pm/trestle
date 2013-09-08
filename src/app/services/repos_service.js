angular.module('Trestle')

/**
 * Service to hold information about the repository that we are
 * connected to and using.
 *
 * The service exposes some things through $scope so that they can be watched
 * by others or easily used in templates.
*/
.service('trReposSrv', function($rootScope, gh) {
   // Set the exposed interface
   this.$scope = $rootScope.$new();
   this.$scope.owner  = null;
   this.$scope.repo   = null;
   this.$scope.config = null;

   // TODO: Move this to a filter helper of some type
   this.$scope.cardSearchText = null;

   // Helper to use when you want a pretty name for the repository
   this.$scope.getFullRepoName = angular.bind(this, function() {
      var scope = this.$scope;
      if (scope.repo && scope.owner) {
         return [scope.owner, scope.repo].join('/');
      }

      return null;
   });

   this.refreshSettings = function(stateParams) {
      this.$scope.owner = stateParams.owner;
      this.$scope.repo  = stateParams.repo;

      this.$scope.config = {   // XXX: Hack, remove this
         "columns": ["In Progress", "Review", "CI", "Ship"]
      };

      // Spawn off the configuration loading
      if(this.$scope.repo) {
         this.loadConfig();
      }
   };

   /**
   * Load the configuration from the Trestle issue ticket.
   */
   this.loadConfig = function() {
      var scope = this.$scope;

      // Grab the configuration file for this repo so that we know
      // the column names
      gh.searchIssues({title: 'OCTOBOARD_CONFIG'})
         .then(function(configIssues) {
            // Filter the search results to only this repo since the API does
            // not allow that.
            var matcher = new RegExp(scope.owner + '\/' + scope.repo);
            var config_issue = _.findWhere(configIssues.items, function(issue) {
               return matcher.test(issue.url);
            });

            // XXX: Need to handle case where we don't find the card.

            // Try and parse the issues body as the configuration blob
            var conf = {};
            try {
               conf = JSON.parse(config_issue.body);
            } catch (err) {
               console.error('Invalid JSON for configuration issues body');
            }

            // Update the view with the configuration
            console.log('Found config: setting:', conf);
            scope.config = conf;

         }, function() {
            console.warn('This repository does not have a configuration file.');
            scope.config = {};
         });
   };
});
