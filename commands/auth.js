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

import users from '../data/users';
import urls from '../data/urls';

Cypress.Commands.add('getLoginData', (userType = 'admin') => users[userType][0]);

Cypress.Commands.add('login', (userType = 'admin') => {
    cy.getLoginData(userType).then(({ username, password }) => {
        cy.request({
            method: 'POST',
            url: urls.login,
            form: true,
            body: {
                login: username,
                password: password,
                loginForm_sent: 1
            }
        });
    });
});

Cypress.Commands.add('logout', () => {
    cy.request({
        method: 'GET',
        url: urls.logout
    });
});
