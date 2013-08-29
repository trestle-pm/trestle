/**
 @ngdoc overview
 @name  github.api

 @description
 Module which provides an interface for the GitHub Api.
 */
angular.module('github.api', ['restangular'])

.factory('GitHubRestangular',  function(Restangular) {
   return Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('https://api.github.com');
   });
})


/**
 @ngdoc service
 @name  github.api.gh

 @description
 Angular service `gh` which provides tools for accessing GitHub API's
 */
.service('gh', function gh(GitHubRestangular, $http, $interpolate, $rootScope, $q) {

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
   token

   ;

   // Extend the API set the access token when we have one
   GitHubRestangular.setFullRequestInterceptor(function(element, operation, what, url, headers, params) {
      return {
         element: element,
         headers: headers,
         // - Add the access_token (only if not set by the caller
         params: angular.extend(params, {access_token: getAccessToken()})
      };
   });

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

   this.buildAPIUrl = function(route, queryArgs) {
      // In order to build the URL we need the api token.
      assert_ready();

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

   /**
    @ngdoc    function
    @name     hasAccessToken
    @methodOf github.api.gh

    @description
    Predicate determining if the service has token to use when accessing
    resources on GitHub.
    */
   this.hasAccessToken = function() {
      return !! getAccessToken();
   };

   /**
    @ngdoc    function
    @name     setAccessToken
    @methodOf github.api.gh

    @description
    Allows setting the API token to use when communicating with the GitHub API.

    @param {string} newToken The new token to use for the service.  Pass a falsy
           value to clear the token.
    @param {string} storageRule Indicates if/where the token can be stored.  By
           passing 'local' or 'storage' the token we be stored for later retrival
           if, for example, the page is reloaded.
    */
   this.setAccessToken = function(newToken, storageRule) {
      // Update our internal reference to the token
      token = newToken;

      // Set the value into storage if asked to
      var action = !!token ? 'setItem' : 'removeItem';
      if (storageRule == 'local' && window.localStorage) {
         window.localStorage[action](token_storage_key, newToken);
      }
      else if (storageRule == 'session' && window.sessionStorage) {
            window.sessionStorage[action](token_storage_key, newToken);
      }
   };

   /**
    @ngdoc    function
    @name     listRepoUsers
    @methodOf github.api.gh

    @description
    Returns the list if users which have access to the supplied repository

    @see http://developer.github.com/v3/repos/#list-contributors

    @param {string} owner The owner of the repository
    @param {string} repo  The name of the repository

    @returns {Promise} When resolved the list of all collaborators.
    */
   this.listRepoUsers = function(owner, repo) {
      var url = ['repos', owner, repo, 'collaborators'].join('/');
      return GitHubRestangular.one(url).get({per_page: 100});
   };

   /**
    @ngdoc    function
    @name     listRepoIssues
    @methodOf github.api.gh

    @description
    Returns the list if issues for a repository.

    - [ ] handle the case where there are more then one page of issues.

    @see http://developer.github.com/v3/issues/#list-issues-for-a-repository

    @param {string} owner             The owner of the repository
    @param {string} repo              The name of the repository
    @param {array.string} args.labels If set then the list of labels to return
           issues for.

    @returns {Promise} When resolved the list of all issues.
    */
   this.listRepoIssues = function(owner, repo, args) {
      // XXX look at how to get more then 100 uses
      // - paging
      return GitHubRestangular
         .one(['repos', owner, repo, 'issues'].join('/'))
         .get({per_page: 100});
   };

   this.listRepos = function() {
      return GitHubRestangular
         .one(['user', 'repos'].join('/'))
         .get({per_page: 100});
   };

   this.listOrgs = function() {
      return GitHubRestangular
         .one(['user', 'orgs'].join('/'))
         .get({per_page: 100});
   };

   this.listOrgRepos = function(org) {
      return GitHubRestangular
         .one(['orgs', org, 'repos'].join('/'))
         .get({per_page: 100});
   };

   this.listAllOrgRepos = function() {
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
    @ngdoc    function
    @name     searchIssues
    @method   searchIssues
    @methodOf github.api.gh

    @description
    Allows for searching the issues the user has access based on certain fields.

    This API is in flux and as such the method may break in the furture.

    http://developer.github.com/v3/search/#search-issues

    @param {string} options.title When set only issues containing this string
           are returned.
    */
   this.searchIssues = function(options) {
      // Build up the search string by looking at the supplied options
      var query = '';
      if (options.title) {
         query = query +options.title+'+in:title';
      }
      return GitHubRestangular.one('search/issues').get(
                                   {q: query},
                                   {'Accept': 'application/vnd.github.preview'});
   };

   /**
    @ngdoc function
    @name  getFile
    @descrption
    Downloads a file from Github and returns the file contents as a string.

    @method   getFile
    @methodOf github.api.gh

    @param {string} owner The owner of the repository to download the file from
    @param {string} repo The name of the repository to download the file from
    */
   this.getFile = function(owner, repo, path) {
      return GitHubRestangular.one(['repos', owner, repo, 'contents', path].join('/')).get()
         .then(function(file) {
            return ghB64Decode(file.content);
         });
   };

});
