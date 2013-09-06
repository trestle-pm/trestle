angular.module( 'GitKan', [
   'templates-app',
   'templates-common',
   'GitKan.board',
   'GitKan.login',
   'GitKan.issue',
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
