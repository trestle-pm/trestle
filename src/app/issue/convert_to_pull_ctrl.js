var mod = angular.module('Trestle');

mod.controller('ConvertToPullCtrl', function($scope, $modal, $rootScope, trRepoModel, gh) {
   _.extend(this, {
      init: function(issue) {
         var me = this;

         $scope.$id = "ConvertToPullCtrl:" + issue.number + $scope.$id;
         this.issue         = issue;
         this.branches      = [];
         this.defaultBranch = trRepoModel.repoDetails.default_branch;

         // Store the branches we should be selecting
         this.baseBranch  = this.defaultBranch;
         this.topicBranch = this.defaultBranch;

         this.compareResults = null;

         // Spawn off queries to fill the list of branches
         gh.getBranches(trRepoModel.owner, trRepoModel.repo)
            .then(function(branches) {
               me.branches = branches;
            }
         );
      },

      selectBaseBranch: function(branchName) {
         this.baseBranch = branchName;
         this.updateDiffDetails();
      },

      selectTopicBranch: function(topicName) {
         this.topicBranch = topicName;
         this.updateDiffDetails();
      },

      updateDiffDetails: function() {
         var me = this;
         gh.compareCommits(trRepoModel.owner, trRepoModel.repo, this.baseBranch, this.topicBranch)
            .then(function(compareResults) {
               me.compareResults = compareResults;
            });
      },

      convertToPull: function() {
         gh.createPullFromIssue(trRepoModel.owner, trRepoModel.repo, this.issue.number,
                                this.baseBranch, this.topicBranch)
            .then(function(result) {
               console.log('pull created');
            });

         // Close up the dialog
         $scope.$close();
      }

   });

});

