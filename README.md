# tao-e2e-runner

End-to-end test runner for use within TAO.

The project is based on Cypress (https://www.cypress.io/)

## Contents of this project vs other TAO extensions

The only code that should be committed to this repo is generic code like server setup, login commands, urls, static data etc.

Your extension-specific test code should be committed to the relevant TAO repo. Tests to do with general functionality of the platform can go in [tao-core](https://github.com/oat-sa/tao-core), while extension-specific tests might go in [taoItems](https://github.com/oat-sa/extension-tao-item), [taoGroups](https://github.com/oat-sa/extension-tao-group), etc.

## Installation

This package will be a dev-dependency of [tao-core](https://github.com/oat-sa/tao-core) from v34.3.0, so to install it within your instance:

```
cd tao/views/build
npm i
```

To install anywhere, manually:

```
npm install @oat-sa/tao-e2e-runner --save-dev
```

## Local configuration file

To enable local configuration for your TAO instance, rename the included file `cypress.env.sample.json` to `cypress.env.json`.

This file contains some configuration which can be used to override the project defaults defined in `cypress.json` in the root of this project (which is not intended to be modified).

Example cypress.env.json:

```json
{
    "baseUrl": "http://localhost:8000",
    "integrationFolder": "../../../../../..",
    "testFiles": "tao/**/e2e/*.spec.js",
    "testName"  : "login",
    "adminUser": "admin",
    "adminPass": "admin"
}
```

`baseUrl` is the URL of the TAO instance you would like to test. It can be local or remote.

The `integrationFolder` is designed to point Cypress from its install location (deep down under `node_modules`), right back to the TAO project root, so it can then discover E2E tests in any extension.

The `testFiles` path is set up to look for E2E tests anywhere under the resolved `integrationFolder`, but you should prefix this path with the folder name of a particular extension, e.g. `tao/views/js/e2e/**/*.spec.js`, to make the Cypress GUI more performant. If you unset it, Cypress will scan for tests in all extensions (could be slow, but might be the desired behaviour for automated, headless testing).

`testName` can be set if you want only a specific test to be run.

- If you open Cypress with `npx cypress open`, the GUI will automatically find the tests defined in the above path.
- If you open Cypress as an app, you will need to pick the folder `/tao/views/build/node_modules/@oat-sa/tao-e2e-runner` as the project root.

## TAO-specific Cypress Commands

Some utility commands have been set up already. We may add to them in future.

```js
// commands/auth.js
cy.getLoginData(userType = 'admin'); // returns login data of requested user type
cy.login(userType = 'admin');        // calls login request and sets session
cy.logout();                         // issues logout request

// commands/server.js
cy.setupServer();                    // configures the Cypress server for TAO cookies and less verbose logging
```

## Tips for writing tests

- Don't define your server and routes in a `before()` hook, define them in `beforeEach()`. Otherwise they will be lost after the first test ("`it()`").
- Same goes for logging in.
- Clean up any resources you created in an `afterEach()` hook so the TAO environment loads as expected next time. If a test fails, the cleanup may not run successfully, and you may have to clean it manually before you re-run.
- Try to define all CSS selectors you need (ideally as few as possible) in a common file which each of your tests can `import`.

In one of the server setup files (`/commands/server.js`), we have configured Cypress to whitelist all cookies starting with `tao_`. (The Cypress default behaviour is to clear cookies after every test.) This is a workaround to avoid logging in and out between every single test we run.

## Best practices

- Do not use `cy.wait(time)`, instead wait for API request or element appearance.
- Avoid connected tests, because if one fails, all will fail.
- Do not use ui to create precondition of test, like login, because it is slow. Instead use ajax request, create command and use it in `before` or `beforeEach`.
- Select ui elements like a human does. Instead of `cy.get('form input.submit')`, use `cy.contains('Submit')`.
- Do not store element as variable, like `const submitButton = cy.contains('button');`

More: https://docs.cypress.io/guides/references/best-practices.html

## NPM Commands

Scan for and run all tests:

```
npm run test
```

Run specific test:

```
npm run test <testname>
```

Run tests on other domain:

_Default: http://tao.docker.localhost_

```
CYPRESS_baseUrl=http://example.com npm run test
```

Run tests from other location:

_Default: exampleTests_
```
CYPRESS_integrationFolder=exampleTests npm run test
```

Modify pattern of test files:

_Default: **/e2e/*.spec.js_

```
CYPRESS_testFiles="**/e2e/*.spec.js" npm run test
```

Open Cypress interface

```
npx cypress open
```

## Environment variables

You can use environment variables in your tests from the command line, that can be defined like so:

```
CYPRESS_foo=bar npm run test
```

and you can use it in your test like:

```js
const foo = Cypress.env('foo');
```

## Project structure

```
|-- commands            # Global commands
    |-- index.js        # Entry point
    |-- login.js        # Login command
    |-- server.js       # Server setup
|
|-- data                # Global data
    |-- users.js        # User list
|
|-- exampleTests        # Example tests for TaoCE
|-- plugins             # Plugin files
|-- screenshots         # Screenshots about failed tests
|-- scripts             # Helper script for the project
    |-- test.js         # Test runner
|
|-- cypress.json        # Cypress config file
|-- cypress.env.sample.json   # Sample local config file
```
