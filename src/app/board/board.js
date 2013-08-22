angular.module( 'GitKan.board', [
  'ui.state'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'board', {
    url: '/board/:owner/:repo',
     controller: 'BoardCtrl',
     templateUrl: 'board/board.tpl.html'
  });
})

;
