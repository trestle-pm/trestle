angular.module( 'Trestle', [
   'templates-app',
   'templates-common',
   'Trestle.board',
   'Trestle.login',
   'Trestle.issue',
   'github.api',
   'ui.sortable',
   'ui.bootstrap',
   'ui.state',
   'ui.route'
])

.config( function ( $stateProvider, $urlRouterProvider ) {
   $urlRouterProvider.otherwise('/login');
})

.controller( 'AppCtrl', function AppCtrl ( ) {
   // Controls everything outside of the ui-view
})

;
