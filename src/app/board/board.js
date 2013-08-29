angular.module( 'GitKan.board', [
   'ui.state'
])

.config(function config( $stateProvider ) {
   $stateProvider
      .state( 'board', {
         url: '/board',
         abstract: true,
         views: {
            body: {
               templateUrl: 'board/board.tpl.html'
            }
         },
         resolve: {
            allRepos: function(gh, $stateParams) {
               return gh.listAllRepos($stateParams.owner, $stateParams.repo);
            }
         }
      })
      .state('board.noRepo', {
         url: '',
         views: {
            toolbar: {
               templateUrl: 'board/toolbar/toolbar.tpl.html',
               controller:  'ToolbarCtrl'
            }
         }
      })
      .state('board.hasRepo', {
         url: '/:owner/:repo',
         views: {
            toolbar: {
               templateUrl: 'board/toolbar/toolbar.tpl.html',
               controller:  'ToolbarCtrl'
            },
            columns: {
               templateUrl: 'board/columns/issue_columns.tpl.html'
            }
         }
      });
})

;
