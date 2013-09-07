angular.module('Trestle.board')

.controller('ColumnsCtrl', function($stateParams, $dialog, gh) {
   this.hasLabel = function(column) {
   this.showBacklog = false;
      return function(issue) {
         var labels = _.map(issue.labels, function(lbl) {
            return _.last(lbl.name.split('-')).trim();
         });
         return _.contains(labels, column);
      };
   };

   this.getColumnWidth = function() {
      var num_columns = $scope.config.columns.length;
      if($scope.showBacklog) {
         num_columns += 1;
      }
      return { width: (90.0 / num_columns) + '%'};
   };

})

;
