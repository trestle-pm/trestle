[![Build Status](https://travis-ci.org/my8bird/octoboard.png?branch=master)](https://travis-ci.org/my8bird/octoboard)

Getting Started
===============

Build It
--------

```bash
# Install helpers
gem install compass

# Get the development deps
#  (these will be placed in ./node_modules)
npm install

# Get the client side deps
#  (these are loaded into /vendor)
./node_modules/.bin/bower install

# Build the whole thing
./node_modules/.bin/grunt
```

Run It
------
```bash
# Open the index page in your browser
# TODO: This doesn't work anymore...
chromium-browser build/index.hmtl
```

Use It
------
XXX

Host It
-------
The entire project is static so to host it on a server all you need to do is place the contents of `/build` on a websever.


Dev
===
Get your environment setup by following the `Build It` steps.  Then "Run It" to verify that eveything good to go.  All of the source is stored in the `src` directory.  Javascript code is split into two locations.

```
# App Specific Code
/src/app/**/*.js

# Reusable Components (must not depend on app code)
/src/common/**/*.js
```

Each module of code is responsible for it own styling, testing, templates, and javascript.  For example the login app has the following layout.

```
/src/app/login
├── login.js
├── login.spec.js
├── login.scss
└── login.tpl.html
```

As you can see there is a Javascript file, a stylesheet file, and a template file.  Everything in one nice little spot.  If a module


Adding a new module
-----------------
 1. Determine if it is an application specific function or does not depend on any pieces of the application.  Store in the `app` dir for former and `common` for the later.
 1. Create the modules directory (name is not important but be sensible)
 1. Add the Javascript, Spec, SASS, and template file as needed.
   * If you are adding a new SASS file you must update `src/sass/main.scss` so that it can find it.  (examples in that file should make it obvious)
 1. Go To Town (you might need to restart grunt)


TODO
====

 * Complete switch to SASS (use login for example)
 * Remove my api key from the code and repo
 * change github api methods for the repo to take the repo names
   intead of being hard coded.
 * Delete LESS files
 * all dragging items around
 * Moving user through routes
   * After login straight to repo list or board depending on how you got there
   * Bouncing the user to the login or home page if their creds are bad
 * Create and store auth token if it does not exist
 * What repo/issue events for updates
 * issue details panel
 * reorder issues
 * Think about mobile (how to move things around
 * Handle GitHub API errors (at least log them)
 * Add a lot of docs
 * Add ability to store attributes on a pull
 * +2 in list
 * build status in list
 * create pull from issue (hot link to GH?)

 * logout
 * Only store creds in local storage if checkbox is ticked (otherwise use session storage)
 * extend doc tool to show `@see`
 * extend doc tool to show `@private` flag

 * Add styling

References
==========
 * The project layout and structure is based upon 
   https://github.com/joshdmiller/ng-boilerplate . 
   See that project for more description on the *why* of the layout.
