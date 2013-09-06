angular.module('Trestle')

/**
* Service to hold information about the repository that we are
* connected to and using.
*/
.service('trReposSrv', function(gh) {

   this.init = function() {
      this.owner  = null;
      this.repo   = null;
      this.config = null;

      this.repoFullName = null;

      // TODO: Move this to a filter helper of some type
      this.cardSearchText = null;
   };

   this.refreshSettings = function(stateParams) {
      this.owner  = stateParams.owner;
      this.repo   = stateParams.repo;

      this.config = {   // XXX: Hack, remove this
         "columns": ["In Progress", "Review", "CI", "Ship"]
      };

      // Precompute the composite repo name
      this.repoFullName = null;
      if (this.repo) {
         this.repoFullName = [this.owner, this.repo].join('/');
      }

      // Spawn off the configuration loading
      if(this.repo) {
         this.loadConfig();
      }
   };

   /**
   * Load the configuration from the Trestle issue ticket.
   */
   this.loadConfig = function() {
      var me = this;

      // Grab the configuration file for this repo so that we know
      // the column names
      gh.searchIssues({title: 'OCTOBOARD_CONFIG'})
         .then(function(configIssues) {
            // Filter the search results to only this repo since the API does
            // not allow that.
            var matcher = new RegExp(me.owner + '\/' + me.repo);
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
            me.config = conf;

         }, function() {
            console.warn('This repository does not have a configuration file.');
            me.config = {};
         });
   };

   // Initialize service
   this.init();
});