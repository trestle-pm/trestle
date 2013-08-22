// Add our module to the namespace
angular.module( 'GitKan.login', [
  'ui.state'
])

// Add our routes so that we can get into the section of the app
.config(function config( $stateProvider ) {
  $stateProvider.state( 'login', {
    url: '/login',
     controller: 'LoginCtrl',
     templateUrl: 'login/login.tpl.html'
  });
})

.controller( 'LoginCtrl', function HomeController($scope, $http, $location, gh) {
   // Always start with a blonk username/password
   $scope.username  = '';
   $scope.passsword = '';

   $scope.attemptLogin = function() {
      var user = $scope.username, pass = $scope.password;

      // Make sure the user entered something
      if (!user || !pass) {
         console.log('dude you must enter something');
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
         // XXX Look at a checkbox and store to session storage if the user
         // does not say to remember them.
         if (auth) {
            // XXX pass this to `gh` somehow
            window.localStorage.setItem('gh-token', auth.token);
         }
      });

      // XXX handle bad cred case (some kind of error screen

   };
})

;
