angular.module('Trestle')

/**
 @ngdoc service
 @name Trestle.issueHelpers

 @description
 Simple service to hold methods helpful to working with issues.
 */
.service('issueHelpers', function($q, gh) {
   var me = this,
       config_header = '<!-- OCTOBOARD',
       config_footer = '-->';

   this.mergeBodyConfig = function(body, configObj) {
      // Store the updated configuration on the issue
      return [body, config_header, JSON.stringify(configObj), config_footer].join('\n');
   };

   this._resolveIssueFields = function(issue) {
      // Add a quick list of the issue label names
      issue.labelNames = _.map(issue.labels, function(labelObj) {
         return labelObj.name;
      });

      // Parse the configuration out of the body text
      resolveIssueConf(issue);

      // Resolve the list of issue comments
      resolveIssueComments(issue);
   };

   function resolveIssueComments(issue) {
      issue.comments = [];
   }

   function resolveIssueConf(issue) {
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
      issue.config = config;
      // Store the cleaned up body
      issue.body = body;

      return issue;
   }

   // When we get issues parse the description and add a custom feed called
   // `config` to the issue.
   gh.addResponseExtractor(function(response, operation, what, url, headers, params) {
      // Operation is provided as lowercase
      if (operation === 'get' && /^repos\/.+\/.+\/issues$/.exec(what)) {
         response = _.map(response, function(issue) {
            me._resolveIssueFields(issue);
            return issue;
         });
      }
      else if (operation === 'get' && /^repos\/.+\/.+\/issues\/[0-9]+$/.exec(what)) {
         var issue = response;
         me._resolveIssueFields(issue);
         return issue;
      }

      return response;
   });
})

/**
 @ngdoc filter
 @name  Trestle.issuesWithLabel

 @description
 Takes an array of GitHub issues and filters it down to only issues with the
 specified labelName

 @param {String} labelName The textual name of a label all issues must have to
        be returned by this filter.
 @returns {Array} Set of issues with the label
 */
.filter('issuesWithLabel', function(issueHelpers) {
   return function(issues, labelName) {
      if (!labelName) { throw new Error('labelName must be set'); }

      return _.filter(issues, function(issue) {
         return _.contains(issue.labelNames, labelName);
      });
   };
})

/**
 @ngdoc filter
 @name  Trestle.issuesInBacklog

 @description
 Takes an array of GitHub issues and filters it down to only issues that do not
 have a label used for a column.

 @returns {Array} Set of issues that are not part of a column
 */
.filter('issuesInBacklog', function(issueHelpers, trRepoModel) {
   return function(issues) {
      var columns = trRepoModel.config.columns;
      return _.filter(issues, function(issue) {
         return _.intersection(issue.labelNames, columns).length === 0;
      });
   };
})

;
