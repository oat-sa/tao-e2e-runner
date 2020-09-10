describe('Toolbar', () => {
    before(() => {
        cy.createTest('api/publications/basic').then(url => cy.visit(url));
    })

    it('Check amount of controls', () => {
        cy.get('.selectable-choice-container .controls.radio').should('have.length', 3)
    })
})
