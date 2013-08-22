angular.module('github.api', [])

.service('gh', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
   var gh_api = "https://api.github.com/",

       token_storage_key = 'gh-token',
       token;

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

   function ghGet(apiPath, queryArgs, overrides) {
      var d = $q.defer();

      var query_args = _.defaults({'access_token': token}, queryArgs);

      var default_options = {
         method: "GET",
         url:    gh_api + apiPath + '?' + _.map(query_args, function(val, key) {
            return key+'='+val;
         }).join('&')
      };

      var p = $http(_.defaults(default_options, overrides || {}));

      p.then(function(res) {
         d.resolve(res.data);
      }, d.reject);

      return d.promise;
   }

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
      return ghGet("repos/"+owner+'/'+repo+"/collaborators");
   };

   this.listRepoIssues = function(owner, repo) {
      assert_ready();
      // XXX look at how to get more then 100 issues for users that might hit that
      return ghGet("repos/"+owner+'/'+repo+"/issues", {'page': 1, 'per_page': 100});
   };

   this.listRepos = function() {
      assert_ready();
      return ghGet("user/repos");
   };

   this.listOrgs = function() {
      assert_ready();
      return ghGet('user/orgs');
   };

   this.listOrgRepos = function(org) {
      assert_ready();
      return ghGet('orgs/'+org+'/repos');
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
    */
   this.getFile = function(owner, repo, path) {
      assert_ready();
      var d = $q.defer();

      var p = ghGet("repos/"+owner+'/'+repo+"/contents/"+path);

      p.then(function(file) {
         var text = ghB64Decode(file.content);
         d.resolve(text);
      }, function() {
         d.reject.apply(d, arguments);
      });

      return d.promise;
   };

}]);
