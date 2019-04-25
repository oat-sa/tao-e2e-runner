context('Logout', () => {
    beforeEach(() => {
        cy.login('admin');
        cy.fixture('urls')
            .as('urls')
            .then(urls => {
                cy.visit(urls.index);
            });
    });

    it('Should logout', function() {
        cy.get('header').within(() => {
            cy.contains('Logout').click({ force: true });
        });

        cy.location('pathname').should('eq', this.urls.login);
    });
});
