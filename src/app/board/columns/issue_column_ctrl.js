angular.module('Trestle.board')

.controller('IssueColumnCtrl', function($scope, gh, GithubHelpers, trReposSrv) {
   /**
    * options:
    *    labelName: The string for the label for this column or undefined.
    *    isBacklog: If true, this this should get all items that are not labeled
    *                with a column.
    */
   this.init = function(options) {
      this.issues     = [];
      this.labelName  = options.labelName;
      this.isBacklog  = !!options.isBacklog;
      this.columnName = (this.isBacklog ? 'Backlog' : this.labelName);

      $scope.$id = "ColumnCtrl_" + this.columnName + $scope.$id;

      var me = this;
      gh.listRepoIssues(trReposSrv.$scope.owner, trReposSrv.$scope.repo, {labels: this.labelName})
         .then(function(issues) {
            me.issues = issues;

            // Parse the issues description for the configuration block
            issues = _.map(issues, function(issue) {
               GithubHelpers.parseIssueConf(issue);
               return issue;
            });

            // Pre sort the issues so that we do not need order by in the
            // template as this messes the jquery ui sortable plugin up.
            issues = _.sortBy(issues, function(issue) {
               return issue.extraData.weight;
            });

            // Expose the issues to the template
            me.issues = issues;
         });
      };

   this.excludeColLabel = function(ghLabel) {
      return ghLabel.name !== this.labelName;
   };

   this._findIssueIdx = function(selectableObj) {
      var issue_id = $(selectableObj.item).data('issue-id');

      // Loop over the issues and find the one with the dragged issues id.
      var issue_idx = _.findIndex(this.issues, function(issue) {
         return issue.id === issue_id;
      });

      return issue_idx;
   };

   /**
    * Called after the user has successfully moved an issue to a new location
    * in the columns.
    *
    * @precondition  The scope issue list is already updated
    * @postcondition The issue ordering in GitHub has been updated
    */
   this._onIssueMoved = function(evt, obj) {
      var issue_idx = this._findIssueIdx(obj);
      console.log(issue_idx);

      // If the issue is not found that our column was updated due to the issue
      // being moved elsewhere.
      if (issue_idx === -1) {
         return;
      }

      var weight,
          above = Number.MIN_VALUE,
          below = Number.MAX_VALUE;

      if (issue_idx === 0) {
         weight = 0;
         if (this.issues.length > 1) {
            weight = this.issues[1].extraData.weight - 1;
         }
      }
      else if (issue_idx === this.issues.length - 1) {
         weight = 0;
         if (this.issues.length > 1) {
            weight = this.issues[this.issues.length - 2].extraData.weight + 1;
         }
      }
      else {
         above = this.issues[issue_idx - 1].extraData.weight;
         below = this.issues[issue_idx + 1].extraData.weight;
         if (above === 0) {
            weight = below / 2.0;
         }
         else if (below === 0) {
            weight = above / 2.0;
         }
         else {
            weight = (above + below) / 2.0;
         }
      }

      // Determine if any data needs to be updated.
      var moved_issue = this.issues[issue_idx],
          cur_weight = moved_issue.extraData.weight;

      if ( (below <= cur_weight) || (above >= cur_weight) ) {
         GithubHelpers.updateIssueConf(moved_issue, function(config) {
            config.weight = weight;
         });
      }
   };

   this._onIssueReceived = function(evt, obj) {
      var issue = this.issues[this._findIssueIdx(obj)],
          me = this;

      // Update the issues labels to only have our columns label
      gh.getIssue(trReposSrv.$scope.owner, trReposSrv.$scope.repo, issue.number)
         .then(function(issue) {
            // - Remove any of the old columns
            var labels = _.filter(_.pluck(issue.labels, 'name'), function(label) {
               return !_.contains(trReposSrv.$scope.config.columns, label);

            });
            // - Add our column
            labels.push(me.labelName);
            console.log(labels);
            gh.updateIssue(trReposSrv.$scope.owner, trReposSrv.$scope.repo,
                           issue.number, {labels: labels})
            .then(function(updatedIssue) {
               console.log('move between columns done');
            });
         });
   };

   this.getSortableOptions = function() {
      var me = this;

      return {
         // Handle reorders
         // Note: Since jquery is triggering this we need to wrap it in a scope
         //       in order to $http and other angular services to know what to do.
         // Note: Using `stop` is `update` does not have the list updated yet
         stop: function(evt, obj) {
            $scope.$apply(me._onIssueMoved.call(me, evt, obj));
         },

         receive: function(evt, obj) {
            $scope.$apply(me._onIssueReceived.call(me, evt, obj));
         },

         // Allow dragging between the columns
         connectWith: '.column-body',
         helper: 'clone',
         opacity: 0.8
      };
   };

});
