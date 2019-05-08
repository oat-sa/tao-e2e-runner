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

const path = require('path');

module.exports = (on, config) => {
    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config

    const { integrationFolder, testFiles, baseUrl, testName} = config.env;

    if (integrationFolder) {
        config.integrationFolder = integrationFolder;
    }

    if (testFiles) {
        config.testFiles = testFiles;
    }

    if (baseUrl) {
        config.baseUrl = baseUrl;
    }

    if (testName) {
        config.testFiles = path.join('**', testName, config.testFiles);
    }

    return config;
};
