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

import itemData from './itemData';

Cypress.Cookies.debug(true); // now Cypress will log when it alters cookies

describe('Items', () => {
    const newItemName = itemData.name;
    const modifiedItemName = `renamed ${itemData.name}`;
    const itemTreeSelector = '#tree-manage_items';
    const mainContainer = '.main-container';
    const actionsContainer = '.tree-action-bar';

    beforeEach(() => {
        cy.server({
            whitelist: (xhr) => {
                // this function receives the xhr object in question and
                // will whitelist if it's a GET that appears to be a static resource
                // return xhr.method === 'GET' && /\.(jsx?|html|css)(\?.*)?$/.test(xhr.url);

                // TAO custom logic for whitelisting: add .tpl and .rdf files to default 'mute' list
                return xhr.method === 'GET' && /\.(jsx?|html|css|tpl|rdf)(\?.*)?$/.test(xhr.url);
            }
        });
        cy.route('POST', '**/editItem').as('editItem');
        cy.route('POST', '**/deleteItem').as('deleteItem');

        cy.login('admin');

        cy.fixture('urls')
            .as('urls')
            .then(urls => {
                cy.visit(`${urls.index}?structure=items&ext=taoItems`);
            });

        cy.wait('@editItem', { timeout: 10000 }); // fails sometimes
    });

    // afterEach(() => {
    //     // Bad practice - https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements
    //     cy.logout();
    // });

    // debugging: stop on failure
    afterEach(function() {
        if (this.currentTest.state === 'failed') {
            Cypress.runner.stop();
        }
    });

    describe('Item creation, edit and delete', () => {
        it('items page loads', function() {
            cy.get(itemTreeSelector);
        });

        it('can create a new item', function() {
            cy.contains('New item').click();

            cy.wait('@editItem').wait(300); // re-rendering time buffer :(

            cy.get(mainContainer).within(() => {
                cy.contains('label', 'Label')
                    .siblings('input')
                    .should('be.visible')
                    .clear()
                    .type(newItemName)
                    .should('have.value', newItemName);

                cy.contains('Save')
                    .click();
            });

            cy.wait('@editItem');

            cy.get(itemTreeSelector)
                .contains(newItemName).should.exist;
        });

        it('can rename previously created item', function() {
            cy.get(itemTreeSelector).within(() => {
                // don't continue if previous test did not create item
                cy.contains(newItemName).should.exist;
                cy.contains(newItemName).click({ force: true });
            });

            cy.wait('@editItem').wait(300); // re-rendering time buffer :(

            cy.get(mainContainer).within(() => {
                cy.contains('label', 'Label')
                    .siblings('input')
                    .should('be.visible')
                    .clear()
                    .type(modifiedItemName)
                    .should('have.value', modifiedItemName);

                cy.contains('Save')
                    .click();
            });

            cy.wait('@editItem');

            cy.get(itemTreeSelector)
                .contains(modifiedItemName).should.exist;
        });

        it('can delete previously created item', function() {
            cy.get(itemTreeSelector).within(() => {
                // don't continue if previous test did not modify item
                cy.contains(modifiedItemName).should.exist;
                cy.contains(modifiedItemName).click({ force: true });
            });

            cy.wait('@editItem').wait(300); // re-rendering time buffer :(

            cy.contains('Delete').click();
            cy.get('.modal-body [data-control="ok"]').click();

            cy.wait('@deleteItem');
        });

        it('has correct action buttons when item is selected', function() {
            // select first unselected item
            cy.get(itemTreeSelector).find('li.instance.selectable:not(.selected)').first().click({ force: true });

            cy.wait('@editItem');

            cy.get(actionsContainer).within(() => {
                Cypress._.forEach([
                    'New class',
                    'Delete',
                    'Import',
                    'Export',
                    'Duplicate',
                    'Copy To',
                    'Move To',
                    'New item'
                ], (text) => {
                    cy.contains(text).should('exist').and('be.visible');
                });
            });

        });

        it('has correct action buttons when nothing is selected', function() {
            // deselect selected list item
            cy.get(itemTreeSelector).find('li.instance.selected').first().click({ force: true });

            cy.get(actionsContainer).within(() => {
                Cypress._.forEach([
                    'New class',
                    'Delete',
                    'Import',
                    'Export',
                    'Duplicate',
                    'Copy To',
                    'Move To',
                    'New item'
                ], (text) => {
                    cy.contains(text).should('not.be.visible');
                });
            });
        });

    });
});
