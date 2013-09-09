describe( 'GitHub API (gh)', function() {
   function clearStorage() {
      localStorage.clear();
      sessionStorage.clear();
   }

   // Make sure the modules under test are loaded
   beforeEach( module('github.api') );

   beforeEach(inject(function($httpBackend) {
      // Start with local and session storage empty (ie. isolate the tests)
      clearStorage();
   }));

   it('should start without a token', inject( function(gh) {
      expect( gh.hasAccessToken() ).not.toBeTruthy();
   }));

   describe('GitHub API', function() {
      beforeEach(inject(function(gh) {
         gh.setAccessToken('sometoken');
      }));

      describe('Repo Listing', function() {
         // XXX these tests are weak but since we just dump the API results back
         // to the caller all that we care about is that the URL is built correctly.
         it('should allow getting the list of repositories', inject(function(gh,
                                                                             $httpBackend,
                                                                             $rootScope) {
            // Given the GitHub API returns no issues
            $httpBackend.expectGET(
                  /https:\/\/api.github.com\/repos\/dude\/where\/issues\\?.*per_page=100.*/).
               respond([]);

            // When the list is requested
            /*var res =*/ gh.listRepoIssues('dude', 'where').then(function(issues) {
               expect( issues.length ).toEqual( 0 );
            });

            $rootScope.$digest();
            $httpBackend.flush();
         }));

         it('should allow getting a file', inject(function(gh, $httpBackend, $rootScope) {
            // Given the GitHub API returns the file
            $httpBackend.expectGET(
                  /https:\/\/api.github.com\/repos\/dude\/where\/contents\/file\.txt\?.*/).
               respond({content: 'aGVsbG8gd29ybGQ='});

            // When the list is requested
            /*var res =*/ gh.getFile('dude', 'where', 'file.txt').then(function(content) {
               expect( content ).toEqual( 'hello world' );
            });

            $rootScope.$digest();
            $httpBackend.flush();
         }));
      });

      describe('Issue Search', function() {
         it('should allow finding an issue by its title', inject(function(gh, $httpBackend,
                                                                              $rootScope) {
            // Given there is no issue
            $httpBackend.expectGET(
                  /https:\/\/api.github.com\/search\/issues?.*q=issuetitle%2Bin:title.*/).
               respond([]);

            // When the list is requested
            /*var res =*/ gh.searchIssues({title: 'issuetitle'}).then(function(issues) {
               // nothing to assert just care that the URL was created correctly.
            });

            $rootScope.$digest();
            $httpBackend.flush();
         }));
      });
   });

});
