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

describe('Timezone', () => {
    beforeEach(() => {
        cy.login('admin');

        cy.server();
        cy.route('POST', '**/properties').as('saveProperties');

        cy.fixture('urls').as('urls');
    });

    it('Change time zone', function() {
        cy.visit(this.urls.index);
        cy.get('header').within(() => {
            cy.contains('My settings').click({ force: true });
        });

        ['Europe/Luxembourg', 'UTC'].forEach(timezone => {
            cy.contains('Time zone')
                .parent()
                .within(() => {
                    cy.get('select').select(timezone);
                });

            cy.contains('Save').click();

            cy.wait('@saveProperties');

            cy.contains('Time zone')
                .parent()
                .within(() => {
                    cy.get('select').should('have.value', timezone);
                });
        });
    });
});
