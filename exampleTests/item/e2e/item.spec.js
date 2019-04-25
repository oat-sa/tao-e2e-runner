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
