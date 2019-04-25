# tao-e2e-runner

End to end test runner.

The project is based on Cypress (https://www.cypress.io/)

## NPM Commands:

Run all test:

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

## Configs:

### Environment variables:

You can use environment variables in your tests, that can be defined as environment variable like:

```
CYPRESS_foo=bar npm run test
```

and you can use it in your test like:

```js
const foo = Cypress.env('foo');
```

You can also define environment variables with config file that should be called **cypress.env.json**. Testrunner supports the following variables:

```json
{
    "adminUser": "admin",
    "adminPass": "admin"
}
```

## Project structure

```
|-- commands            # Global commands
    |-- index.js        # Entry point
    |-- login.js        # Login command
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
```

## Cypress Commands:

```js
// Login
getLoginData(userType = 'admin'); // returns login data of requested user type
login(userType = 'admin');        // calls login request and sets session
```
