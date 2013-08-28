angular.module('GitKan.board')

.controller( 'IssueDetailsCtrl', function($scope, $rootScope, issue, dialog) {
   $scope.issue = issue;
})

;
