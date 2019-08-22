# Running tao-e2e-runner from a Docker container

> In some situations (for example CI), it is desirable to run Cypress tests in a predictable, dependency-free way, against a separate application instance that you want to test. Loading the Cypress test runner inside a Docker container is a good way to achieve this: in fact, Cypress.io provide their own Docker images and guides for doing this: <https://www.cypress.io/blog/2019/05/02/run-cypress-with-a-single-docker-command>

This guide makes use of the `cypress/included` public Docker image, which contains Node, npm, and the Cypress package installed globally.

The E2E tests will be run headlessly, although screenshots of test failures will still be saved into `screenshots/`

The TAO instance you test against can theoretically be online, local or Dockerised. The most reliable results will come from a Dockerised instance, so that is what this guide focuses on.

## 1. docker-compose approach

### Prerequisites

- A Dockerised instance of TAO

In this example we're using the basic stack of <https://github.com/ekkinox/tao-docker> which has containers for nginx, phpfpm, and mariadb. You need to bring up your stack and install TAO within the phpfpm container to get started.

If your existing stack is different, see the CLI approach below.

Intended project structure:

```
package-tao/ <- root of your instance
├- tao/
|  └- views/
|     └- build/
|        └- node_modules/
|           └- @oat-sa/
|              └- tao-e2e-runner/ <- npm package or git repo
|                 ├- commands/
|                 ├- cypress.json <- important config values
|                 ├- cypress.env.json <- optional overrides
|                 ├- data/
|                 ├- docker/
|                 |  └- docker-compose.yml <- container definitions
|                 ├- exampleTests/
|                 ├- plugins/
|                 └- screenshots/ <- test output saved here
|
└-taoQtiTest/
  └- views/
     └- js/
        └- e2e/
           └- *.spec.js <- location of e2e tests for taoQtiTest
```

### Configuration values

When Cypress runs, it looks for the following values:

- `baseUrl`: (*required*) the URL where the TAO instance can be accessed
- `integrationFolder`: where the E2E tests reside. If not provided, will fall back to `exampleTests`
- `testFiles`: glob pattern for finding tests within the `integrationFolder`

Don't forget to set the TAO-specific values, some tests are likely to need them:

- `adminUser`
- `adminPass`

All these values can be passed to Cypress in several ways:

1. as part of the main `cypress.json` configuration
2. (*recommended*) as part of a `cypress.env.json` file which overrides the default values
3. as config parameters after the cypress command: `cypress run --config baseUrl=http://localhost:8888`
4. as environment variables before running the command: `CYPRESS_baseUrl=http://localhost:8888 npx cypress run`
5. as environment variable passthrough parameters in a Docker command: `-e CYPRESS_baseUrl=http://localhost:8888`
6. (*recommended*) as environment variables in your `docker-compose.yml` container definition

### Volumes

The `cypress/included` container needs 2 volumes mapped into it:

1. the `tao-e2e-runner` folder, for the testing configuration, custom commands and fixtures
2. the TAO filesystem, because E2E tests are stored in the `views/js/e2e` folder of each extension. This is satisfied in the provided configuration by reusing the volume from `tao_phpfpm`.

The `integrationFolder` path should be relative to where the TAO filesystem is mapped inside the `cypress/included` container.

### Finally, run some tests

Run the following command to build the defined containers, bring them up, stop them when `cypress run` finishes and return with the exit code from Cypress (equal to the number of failed tests).

`docker-compose up -d --exit-code-from tao_e2e`

## 2. Command line approach

If the stack defined in `docker-compose.yml` doesn't meet your needs, and you just want to run the Cypress container on its own, that can be done using a single command:

Assuming that your TAO stack is running on the network `docker_tao_network`, and you are in `/tao/views/build/node_modules/@oat-sa/tao-e2e-runner`:

```sh
docker run -it \
-v $PWD/../../../../../../:/var/www/html \
-v $PWD:/cypress \
-w /cypress \
-e CYPRESS_baseUrl='http://tao_nginx' \
-e CYPRESS_integrationFolder='../var/www/html/tao/views/js' \
-e CYPRESS_testFiles='**/*.spec.js' \
--network docker_tao_network \
cypress/included:3.4.0
```

Breakdown of the above:

```
-v $PWD/../../../../../../:/var/www/html # maps your local project root to the webserver's folder in the container
-v $PWD:/cypress                         # maps the current folder to an arbitrary /cypress folder in the container
-w /cypress                              # the working directory in the container, where commands are run
-e CYPRESS_baseUrl='http://tao_nginx'    # pass this environment variable through
-e CYPRESS_integrationFolder='../var/www/html/tao/views/js' # pass this environment variable through
-e CYPRESS_testFiles='**/*.spec.js'      # pass this environment variable through
--network docker_tao_network             # make this container join the network the webserver is on
cypress/included:3.4.0                   # dockerhub image name & tag
```

These parameters obviously depend on the setup of the Dockerised TAO you are testing against.

## Troubleshooting

### Connection refused or `ECONNREFUSED 127.0.0.1:80`

Your URLs or hostnames might be misconfigured.

The Cypress `baseUrl` should be equal to the web server's `container_name`, which should also match the `ROOT_URL` defined in `/config/generis.conf.php` of your TAO instance.

For example, in the provided `docker-compose.yml` all three values are set to `tao_nginx`. Other approaches such as `localhost`, `127.0.0.1` or fixed IP addresses are not recommended as they will be more problematic.

### No tests found

Your `integrationFolder` + `testFiles` path is not resolving where you expected.

Make sure you have the `tao-e2e-runner` folder mapped into the `cypress/included` container and the working directory set. Unset any overrides for the above config values, and they should fall back to `exampleTests` + `**/e2e/*.spec.js`. If these local tests are able to be run, it's just a case of working out the correct relative path for the other tests.

### Timeouts

If a test is failing due to timed out requests, it could be that the test is not well-written, or it could be due to the slower networking between containers.

Fortunately, the Cypress timeouts can also be configured by environment variables:

Defaults:

- `-e CYPRESS_defaultCommandTimeout=10000`
- `-e CYPRESS_requestTimeout=5000` (suggested: try 10000 or 15000)

More info on [timeouts](https://docs.cypress.io/guides/references/configuration.html#Timeouts).

### Cypress DEBUG output

Add the following environment variable to see some useful logging output which can help to debug your setup:

- `-e DEBUG=cypress:server:project`

More info on [debugging](https://docs.cypress.io/guides/guides/debugging.html#Print-DEBUG-logs).
