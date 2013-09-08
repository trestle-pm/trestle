angular.module('Trestle')

/**
 * Service to hold information about the repository that we are
 * connected to and using.
 *
 * The service exposes some things through $scope so that they can be watched
 * by others or easily used in templates.
*/
.service('trReposSrv', function($rootScope, gh, $dialog, $q) {
   var TRESTLE_CONFIG_TITLE = 'TRESTLE_CONFIG',
       DEFAULT_CONFIG = {
         "columns": ["In Progress", "Review", "CI", "Ship"]
       };

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

      // XXX: Hack, remove this
      this.$scope.config = angular.copy(DEFAULT_CONFIG);

      // Spawn off the configuration loading
      if(this.$scope.repo) {
         this.loadConfig();
      }
   };

   /**
   * Load the configuration from the Trestle issue ticket.
   *
   * Q: How should we handle case where we don't end up with a config?
   */
   this.loadConfig = function() {
      var me = this,
          scope = this.$scope;

      // Attempt to lookup the configuration issue for this repository
      // - If found, then set it and continue
      // - If not, then prompt to create and try loading it again
      me.readConfig().then(
         function(configResult) {
            if(null !== configResult) {
               console.log('config loaded');
               scope.config = configResult;
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
            gh.createIssue(scope.owner, scope.repo,
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
         var matcher = new RegExp(scope.owner + '\/' + scope.repo);
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
