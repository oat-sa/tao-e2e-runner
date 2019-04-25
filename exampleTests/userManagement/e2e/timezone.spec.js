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
