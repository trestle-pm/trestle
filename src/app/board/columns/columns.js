angular.module('Trestle.board')

.controller('ColumnsCtrl', function($scope, trRepoModel) {
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
      var config      = trRepoModel.config,
          num_columns = config ? config.columns.length : 0;

      if($scope.showBacklog) {
         num_columns += 1;
      }

      return { width: (100.0 / num_columns) + '%'};
   };

})

;
