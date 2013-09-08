angular.module('Trestle')

.service('trRepoModel', function($rootScope) {
   var scope = $rootScope.$new();

   // Set some defaults for the application
   scope = $rootScope.$new();
   scope.owner  = null;
   scope.repo   = null;
   scope.config = null;

   // XXX upcoming
   scope.issues = [];

   // TODO: Move this to a filter helper of some type
   scope.cardSearchText = null;

   // Helper to use when you want a pretty name for the repository
   scope.getFullRepoName = angular.bind(this, function() {
      if (scope.repo && scope.owner) {
         return [scope.owner, scope.repo].join('/');
      }

      return null;
   });

   return scope;
})

/**
 * Service to hold information about the repository that we are
 * connected to and using.
*/
.service('trReposSrv', function(gh, $dialog, $q, trRepoModel) {
   var TRESTLE_CONFIG_TITLE = 'TRESTLE_CONFIG',
       DEFAULT_CONFIG = {
         "columns": ["In Progress", "Review", "CI", "Ship"]
       };

   this.refreshSettings = function(stateParams) {
      trRepoModel.owner = stateParams.owner;
      trRepoModel.repo  = stateParams.repo;

      // XXX: Hack, remove this
      trRepoModel.config = angular.copy(DEFAULT_CONFIG);

      // Spawn off the configuration loading
      if(trRepoModel.owner && trRepoModel.repo) {
         this.loadConfig();
      }
   };

   /**
   * Load the configuration from the Trestle issue ticket.
   *
   * Q: How should we handle case where we don't end up with a config?
   */
   this.loadConfig = function() {
      var me = this;

      // Attempt to lookup the configuration issue for this repository
      // - If found, then set it and continue
      // - If not, then prompt to create and try loading it again
      me.readConfig().then(
         function(configResult) {
            if(null !== configResult) {
               console.log('config loaded');
               trRepoModel.config = configResult;
            }
            // No config, so prompt to create one
            else {
               promptToCreateConfig().then(
                  function(created_config) {
                     if(created_config) {
                        me.loadConfig();
                     } else {
                        console.log('proceeding with no config');
                     }
                  }
               );
            }
         },
         function() {
            // todo: handle this case by fixing up configuration.
            console.error('Error reading config');
         }
      );

      // Called when there is no configuration found and we need to handle that.
      //
      // Returns true if the user chose to create a configuration and we created it.
      function promptToCreateConfig() {
         var deferred = $q.defer();

         // Prompt to see if the user wants to create config
         var msgbox = $dialog.messageBox('Missing Configuration',
                                         'Create trestle configuration?',
                                         [{label: 'Create', result: 'create'},
                                          {label: 'Cancel', result: 'cancel'}]);
         msgbox.open().then(function(result) {
            if('create' === result) {
               console.log('Creating configuration...');
               create_config();  // resolve the deferred internally
            } else {
               console.log('Skipping config creation');
               deferred.resolve(false);
            }
         });

         function create_config() {
            gh.createIssue(trRepoModel.owner, trRepoModel.repo,
                           TRESTLE_CONFIG_TITLE, JSON.stringify(DEFAULT_CONFIG))
               .then(function(result_issue) {
                  console.log('issue created');
                  gh.updateIssue(scope.owner, scope.repo,
                                 result_issue.number, {state: 'closed'}).then(
                     function(result_patch) {
                        deferred.resolve(true);
                     }
                  );
               },
               function(err) {
                  console.error('Failed to create config issue');
                  deferred.resolve(false);
               }
            );
         }

         return deferred.promise;
      }
   };

   /**
   * Returns a promise that is resolved with the current configuration for
   * the repository or null if not found.
   * It is rejected if the config fails to parse.
   */
   this.readConfig = function() {
      var scope         = this.$scope,
          read_deferred = $q.defer(),
          conf          = {};

      gh.searchIssues({title: TRESTLE_CONFIG_TITLE}).then(function(configIssues) {
         // Filter the search results to only this repo since the API does
         // not allow that.
         var matcher = new RegExp(trRepoModel.owner + '\/' + trRepoModel.repo);
         var config_issue = _.findWhere(configIssues.items, function(issue) {
            return matcher.test(issue.url);
         });

         // Issue not found
         if(undefined === config_issue) {
            read_deferred.resolve(null);
         } else {
            // Try and parse the issues body as the configuration blob
            try {
               conf = JSON.parse(config_issue.body);
               read_deferred.resolve(conf);
            } catch (err) {
               console.error('Invalid JSON for configuration issues body');
               read_deferred.reject('JSON parse error');
            }
         }
      },
      // error
      function() {
         read_deferred.resolve(null);
      });

      return read_deferred.promise;
   };

});
