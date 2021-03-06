/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

const { exec } = require('child_process');

const testName = process.argv[2];

const cypressEnvironmentVariables = {};

if (testName) {
    cypressEnvironmentVariables.testName = testName;
}

const command =
    Object.keys(cypressEnvironmentVariables)
        .map(variableName => `CYPRESS_${variableName}=${cypressEnvironmentVariables[variableName]}`)
        .join(' ') + ' npx cypress run';

console.log(command); // eslint-disable-line no-console
const cypress = exec(command);

cypress.stdout.on('data', data => console.log(data)); // eslint-disable-line no-console
cypress.stderr.on('data', data => console.error(data)); // eslint-disable-line no-console
