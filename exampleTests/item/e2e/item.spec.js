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

describe('Items', () => {
    const newItemName = itemData.name;
    const modifiedItemName = `renamed ${itemData.name}`;
    const itemTreeSelector = '#tree-manage_items';

    beforeEach(() => {
        cy.server();

        cy.route('POST', '**/editItem').as('editItem');
        cy.route('POST', '**/deleteItem').as('deleteItem');

        cy.login('admin');

        cy.fixture('urls')
            .as('urls')
            .then(urls => {
                cy.visit(`${urls.index}?structure=items&ext=taoItems`);
            });

        cy.wait('@editItem');
    });

    describe('Item creation, edit and delete', () => {
        it('items page loads', function() {
            cy.get(itemTreeSelector);
        });

        it('create new item', function() {
            cy.contains('New item').click();

            cy.wait('@editItem');

            cy.contains('label', 'Label')
                .parent()
                .find('input')
                .clear()
                .type(newItemName);

            cy.contains('Save').click();

            cy.wait('@editItem');

            cy.get(itemTreeSelector).within(() => {
                cy.contains(newItemName);
            });
        });

        it('rename previously created item', function() {
            cy.get(itemTreeSelector).within(() => {
                cy.contains(newItemName).click({ force: true });
            });

            cy.wait('@editItem');

            cy.contains('label', 'Label')
                .parent()
                .find('input')
                .clear()
                .type(modifiedItemName);

            cy.contains('Save').click();

            cy.wait('@editItem');

            cy.get(itemTreeSelector).within(() => {
                cy.contains(modifiedItemName);
            });
        });

        it('delete previously created item', function() {
            cy.get(itemTreeSelector).within(() => {
                cy.contains(modifiedItemName).click({ force: true });
            });

            cy.wait('@editItem');

            cy.contains('Delete').click();
            cy.get('.modal').within(() => {
                cy.contains('Ok').click();
            });

            cy.wait('@deleteItem');
        });
    });
});
