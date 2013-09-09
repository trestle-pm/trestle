angular.module('Trestle.board')

.service('GithubHelpers', function($rootScope, gh) {
   var me = this,
       config_header = '<!-- OCTOBOARD',
       config_footer = '-->';

   this.parseIssueConf = function(issue) {
      var config = {
         // XXX only do this if the config did not have it already
         weight: _.random(-1000, 1000)//Number.MIN_VALUE, Number.MAX_VALUE)
      };

      var body = issue.body;

      var lines = _.map(body.split('\n'), function(line) {return line.trim();}),
          octo_begin = _.findIndex(lines, function(line) {return line === config_header;}),
          octo_end   = _.findIndex(lines, function(line) {return line === config_footer;});

      if (octo_begin > -1 && octo_end > -1) {
         var config_str = lines.slice(octo_begin+1, octo_end).join('\n');
         try {
            config = _.defaults(JSON.parse(config_str), config);
            // Join non-config sections as the actual description
            // - Note: This strips the XML comment lines also
            body = [].concat(lines.slice(0, octo_begin),
                             lines.slice(octo_end + 1, lines.length-1)).join('\n');
         } catch (err) {
            console.error('Loading configuration:', body, err);
         }
      }

      // Store the extra configuration
      issue.extraData = config;
      // Store the cleaned up body
      issue.body = body;

      return config;
   };

   this.updateIssueConf = function(issue, mutator) {
      var repo_info = gh.extractRepoInfo(issue.html_url);
      // Get the latest version of the issues description
      gh.getIssue(repo_info.owner, repo_info.repo, issue.number)
         .then(function(updatedIssue) {
            me.parseIssueConf(updatedIssue);
            // Apply the mutator and pay attention for errors
            try {
               mutator(issue.extraData);
            } catch (err) {
               console.error(err);
               return;
            }

            // Store the updated configuration on the issue
            var fields = {body: [issue.body,
                                 config_header,
                                 JSON.stringify(issue.extraData),
                                 config_footer].join('\n')};

            gh.updateIssue(repo_info.owner, repo_info.repo, issue.number, fields)
               .then(function() {
                  // XXX some how this is updating the DOM.
                  //     Is restanguler doing that??
                  console.log('updated');
               });
         }, function() {
            console.log('had error', arguments);
         });
   };
})

;
