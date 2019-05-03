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

import classData from './classData';
import subClassData from './subClassData';

Cypress.Cookies.debug(true); // now Cypress will log when it alters cookies

describe('Classes', () => {
    const newClassName = classData.name;
    const newSubClassName = subClassData.name;
    const modifiedClassName = `renamed ${classData.name}`;

    const itemTreeSelector = '.resource-tree';
    const actionsContainer = '.tree-action-bar';
    const contentContainer = '.content-container';
    const rootClassSelector = '.class[data-uri="http://www.tao.lu/Ontologies/TAOItem.rdf#Item"]';
    const deleteClassAction = '.action[data-action="removeNode"][data-context="class"]';

    beforeEach(() => {
        cy.setupServer();
        cy.route('POST', '**/editItem').as('editItem');
        cy.route('POST', '**/editClassLabel').as('editClassLabel');
        cy.route('POST', '**/deleteClass').as('deleteClass');

        cy.login('admin');

        cy.fixture('urls')
            .as('urls')
            .then(urls => {
                cy.visit(`${urls.index}?structure=items&ext=taoItems`);
            });

        cy.wait('@editItem', { timeout: 10000 }); // fails sometimes
    });

    // debugging: stop on failure
    afterEach(function() {
        if (this.currentTest.state === 'failed') {
            Cypress.runner.stop();
        }
    });

    describe('Class creation, edit and delete', () => {
        it('items page loads', function() {
            cy.get(itemTreeSelector);
        });

        it('can create a new class from the root class', function() {
            // select the root Item class
            // it can be offscreen due to scrollable panel (so let's force click)
            cy.get(rootClassSelector).click({force: true});

            cy.contains('New class').click();

            cy.wait('@editClassLabel').wait(300); // re-rendering time buffer :(

            cy.get(contentContainer).within(() => {
                cy.get('.section-header')
                    .should('exist').and('be.visible')
                    .and(($el) => {
                        // standard 'contains' selector won't work because of dynamic string value,
                        // so let's use regex to partially match
                        expect($el.html()).to.match(/Edit class/);
                    });

                cy.contains('label', 'Label')
                    .siblings('input')
                    .should('be.visible')
                    .clear()
                    .type(newClassName)
                    .should('have.value', newClassName);

                cy.contains('Save')
                    .click();
            });

            cy.wait('@editClassLabel');

            cy.get(itemTreeSelector)
                .contains(newClassName).should('exist');
        });

        it('can create a new subclass from created class', function() {
            // select first subclass of root Item class
            // it can be offscreen due to scrollable panel (so let's force click)
            cy.get(rootClassSelector).within(() => {
                cy.get('.class:not(.selected)').first().click({force: true});
            });

            cy.contains('New class').click();

            cy.wait('@editClassLabel').wait(300); // re-rendering time buffer :(

            cy.get(contentContainer).within(() => {
                cy.get('.section-header')
                    .should('exist').and('be.visible')
                    .and(($el) => {
                        // standard 'contains' selector won't work because of dynamic string value,
                        // so let's use regex to partially match
                        expect($el.html()).to.match(/Edit class/);
                    });

                cy.contains('label', 'Label')
                    .siblings('input')
                    .should('be.visible')
                    .clear()
                    .type(newSubClassName)
                    .should('have.value', newSubClassName);

                cy.contains('Save')
                    .click();
            });

            cy.wait('@editClassLabel');

            cy.get(itemTreeSelector)
                .contains(newSubClassName).should('exist');
        });

        it('can rename previously created class', function() {
            cy.get(itemTreeSelector).within(() => {
                // don't continue if previous test did not create class
                cy.contains(newClassName).should('exist');
                cy.contains(newClassName).click({force: true});
            });

            cy.wait('@editClassLabel').wait(300); // re-rendering time buffer :(

            cy.get(contentContainer).within(() => {
                cy.get('.section-header')
                    .should('be.visible')
                    .and(($el) => {
                        // standard 'contains' selector won't work because of dynamic string value,
                        // so let's use regex to partially match
                        expect($el.html()).to.match(/Edit class/);
                    });

                cy.contains('label', 'Label')
                    .siblings('input')
                    .should('be.visible')
                    .clear()
                    .type(modifiedClassName)
                    .should('have.value', modifiedClassName);

                cy.contains('Save')
                    .click();
            });

            cy.wait('@editClassLabel').wait(300); // re-rendering time buffer :(

            cy.get(itemTreeSelector)
                .contains(modifiedClassName)
                .should('exist').and('be.visible');
        });

        it('can delete previously created class', function() {
            cy.get(itemTreeSelector).within(() => {
                // don't continue if previous test did not modify item
                cy.contains(modifiedClassName).should('exist');
                cy.contains(modifiedClassName).click({force: true});
            });

            cy.wait('@editClassLabel').wait(300); // re-rendering time buffer :(

            cy.get(deleteClassAction).click();
            cy.get('.modal-body [data-control="ok"]').click();

            cy.wait('@deleteClass');
        });

        it('has correct action buttons when class is selected', function() {
            // select the root Item class
            // it can be offscreen due to scrollable panel (so let's force click)
            cy.get(rootClassSelector).click({force: true});

            cy.wait('@editClassLabel');

            // check the visible action buttons
            cy.get(actionsContainer).within(() => {
                Cypress._.forEach([
                    'New class',
                    'Delete',
                    'Import',
                    'Export',
                    'Move To',
                    'New item'
                ], (buttonText) => {
                    // there are multiple buttons with the same name, hidden and not hidden
                    // so we have to be careful to select the right ones
                    cy.get('.action:not(.hidden)')
                        .contains(buttonText)
                        .should('exist').and('be.visible');
                });
            });
        });

    });
});
