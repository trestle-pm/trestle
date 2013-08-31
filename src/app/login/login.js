/**
 @ngdoc overview
 @name  octoboard.login

 @description
 stuff about login
 */

// Add our module to the namespace
angular.module( 'GitKan.login', [
  'ui.state'
])

// Add our routes so that we can get into the section of the app
.config(function config( $stateProvider ) {
  $stateProvider.state( 'login', {
     url: '/login',
     views: {
        body: {
           controller:  'LoginCtrl',
           templateUrl: 'login/login.tpl.html'
        }
     }
  });
})

.controller( 'LoginCtrl', function HomeController($scope, $http, $location, gh) {
   // Always start with a blonk username/password and remember turned off
   $scope.username   = '';
   $scope.passsword  = '';
   $scope.rememberMe = false;

   $scope.attemptLogin = function() {
      var user = $scope.username, pass = $scope.password;

      // Make sure the user entered something
      if (!user || !pass) {
         console.log('Dude you must enter something');
         // XXX look at basic field validation
         return;
      }

      // Try and login into GitHub.
      var auth = user + ':' + pass;
      var p = $http({
         method: 'GET',
         url:    'https://api.github.com/authorizations',
         headers: {
            Authorization: 'Basic ' + window.btoa(auth)
         }
      });

      // If these are valid creds then create a token we can use from now.
      // - Be smart and tag it so that we can use the same one latter for our app
      p.success(function(auths) {
         // See if any of the authorizations are for our app
         var auth = _.find(auths, function(auth) {
            return auth.note == "gitkan";
         });

         // If none of the authorizations are for gitkan then add one for the user
         // XXX

         // Cache the token so that we can use it later
         if (auth) {
            // Pass the token off to the `gh` service
            // - Tell the github service how long to hold the authentication
            gh.setAccessToken(auth.token,
                              $scope.rememberMe ? 'local' : 'session');

            // Yeah, for successful auth so bounce the user to next page
            // - If the next page was supplied then use that otherwise
            //   bounce the user to the repo list by default
            $location.path('/board');
         }
      });

      // XXX handle bad cred case (some kind of error screen

   };
})

;
