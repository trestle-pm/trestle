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
         }
      })
      .state('board.noRepo', {
         url: '',
         views: {
            toolbar: {
               template: 'board/columns/issue_columns.tpl.html'
            }
         }
      })
      .state('board.hasRepo', {
         url: '/:owner/:repo',
         views: {
            toolbar: {
               template: 'board/columns/issue_columns.tpl.html'
            },
            columns: {
               templateUrl: 'board/columns/issue_columns.tpl.html'
            }
         }
      });
})

;
