angular.module( 'GitKan', [
  'templates-app',
  'templates-common',
  'GitKan.board',
  'GitKan.login',
  'GitKan.repo_list',
  'github.api',
  'draggable',
  'ui.state',
  'ui.route'
])

.config( function ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise('/about');
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
   // Controls everything outside of the ui-view
})

;
