/**
 @ngdoc overview
 @name  github.api

 @description
 Module which provides an interface for the GitHub Api.
 */
angular.module('github.api', [])


/**
 @ngdoc service
 @name  github.api.gh

 @description
 Angular service `gh` which provides tools for accessing GitHub API's
 */
.service('gh', function gh($http, $interpolate, $rootScope, $q) {

   var
   /**
    @ngdoc      property
    @name       github_url_root
    @propertyOf github.api.gh

    @description
    Key to use when storing the API token in local storage.

    @private
    */
   token_storage_key = 'gh-token',
   token;

   /**
    @ngdoc function
    @name  getAccessToken
    @methodOf github.api.gh

    @description
    Helper which will read the token from storage if they token is not
    currently set.

    @private

    @returns {string} The token or falsy if not found.
    */
   function getAccessToken() {
      // If the token is not set then try local storage
      if (!token && window.localStorage) {
         token = window.localStorage.getItem(token_storage_key);
      }

      // If the token is still not set try the session storage
      if (!token && window.sessionStorage) {
         token = window.sessionStorage.getItem(token_storage_key);
      }

      return token;
   }

   /**
    Helper which will raise an error if the GitHub token is not set.

    @private
    */
   function assert_ready() {
      // Try to get the access token
      getAccessToken();

      // Raise an error if the token could not be found
      if (!token) {
         throw new Error('Unable to find GitHub API access token');
      }
   }

   /**
    Helper function to convert GitHub's multiple string base 64 encoding into
    the actual string it represents.
    */
   function ghB64Decode(str) {
      // Decode each line seperatly and join them as a single string
      var lines = _.map(str.split('\n'), function(b64Str) {
         return window.atob(b64Str);
      });
      return lines.join('');
   }

   this._get = function(apiPath, queryArgs, options) {
      var d = $q.defer();

      var query_args = _.defaults({'access_token': token}, queryArgs);

      var p = $http.get(this.buildAPIUrl(apiPath, queryArgs), options);

      p.then(function(res) {
         d.resolve(res.data);
      }, d.reject);

      return d.promise;
   };

   this.buildAPIUrl = function(route, queryArgs) {
      var query = _.defaults({}, queryArgs, {access_token: token}),
          query_str = _.map(query, function(val, key) {
             return key + '=' + val;
          }).join('&');

      // Allow passing the route as a list since that makes things
      // cleaner in usage.
      route = angular.isArray(route) ? route.join('/') : route;

      // Build the actual URL and send it out
      return 'https://api.github.com/' + route + '?' + query_str;
   };

   this.setAccessToken = function(newToken, storageRule) {
      // Update our internal reference to the token
      token = newToken;

      // Set the value into storage if asked to
      if (storageRule == 'local' && window.localStorage) {
         window.localStorage.setItem(token_storage_key, newToken);
      }
      else if (storageRule == 'session' && window.sessionStorage) {
         window.localStorage.setItem(token_storage_key, newToken);
      }
   };

   this.listRepoUsers = function(owner, repo) {
      assert_ready();
      return this._get(['repos', owner, repo, 'collaborators']);
   };

   this.listRepoIssues = function(owner, repo) {
      assert_ready();
      // XXX look at how to get more then 100 issues for users that might hit that
      return this._get(['repos', owner, repo, 'issues']);
   };

   this.listRepos = function() {
      assert_ready();
      return this._get(['user', 'repos']);
   };

   this.listOrgs = function() {
      assert_ready();
      return this._get(['user', 'orgs']);
   };

   this.listOrgRepos = function(org) {
      assert_ready();
      return this._get(['orgs', org, 'repos']);
   };

   this.listAllOrgRepos = function() {
      assert_ready();
      var me = this;

      var d = $q.defer();

      // Get all of the users orginizations
      var p = this.listOrgs();

      // Once we have all of the orgs
      // - Loop over each one and retrieve the repos for the org
      p.then(function(orgs) {
         // Kick of a search for each org in parallel
         var all_orgs_repos = $q.all(_.map(orgs, function(org) {
            return me.listOrgRepos(org.login);
         }));

         // Fire our deferred when the calls finish
         all_orgs_repos.then(function(repos) {
            // Flatten all of the repos into one array
            var all_repos = _.flatten(repos);

            // Resolve the deferred
            d.resolve(all_repos);
         }, d.reject);
      });

      // Return our internal deferred so that anyone waiting on this method
      // gets all of the results.
      return d.promise;
   };

   this.listAllRepos = function() {
      assert_ready();
      var me = this;

      return $q.all([
         // We want all of the users repos
         this.listRepos(),
         // And all of the repos their orgs have also
         this.listAllOrgRepos()
      ]).then(function(repos) {
         // Merge all of the repos together
         return _.flatten(repos);
      }, function onError() {
         console.error(arguments);
      });
   };

   /**
    Downloads a file from Github and returns the file contents as a string.

    @method getFile
    @param owner {String} The owner of the repository to download the file from
    @param repo  {String} The name of the repository to download the file from
    */
   this.getFile = function(owner, repo, path) {
      assert_ready();
      var d = $q.defer();

      var p = this._get(["repos", owner, repo, 'contents', path]);

      p.then(function(file) {
         var text = ghB64Decode(file.content);
         d.resolve(text);
      }, function() {
         d.reject.apply(d, arguments);
      });

      return d.promise;
   };

});
