angular.module('Trestle.board')

/**
* Controller for managing the milestones columns page.
*/
.controller('MilestoneColumnsCtrl', function($scope, trRepoModel) {
   $scope.$id = "MilestoneColumnsCtrl:" + $scope.$id;

   this.getColumnWidth = function() {
      var num_columns = trRepoModel.milestones ? trRepoModel.milestones.length : 0;

      return { width: (100.0 / (num_columns + 1) ) + '%'};
   };

})

;
