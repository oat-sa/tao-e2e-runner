# tao-e2e-runner

End to end test runner

## NPM Commands:

Run all test:

```
$ npm run test
```

Run specific test:

```
$ npm run test <testname>
```

Run test on other domain:

_Default: http://tao.docker.localhost_

```
$ CYPRESS_baseUrl=http://example.com npm run test
```

Run example tests:

```
$ CYPRESS_integrationFolder=exampleTests npm run test item
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
|-- plugins             # Plugin files
|-- screenshots         # Screenshots about failed tests
|-- scripts             # Helper script for the project
    |-- test.js         # Test runner
|
|-- cypress.json        # Cypress config file
|-- Makefile            # Commands for project prepare
```

## Cypress Commands:

```js
// Login
getLoginData((userType = 'admin')); // returns login data of requested user type
login((userType = 'admin')); // calls login request and sets session
```
