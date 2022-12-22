describe('Product Detail: Visual tests properties area ', () => {
    beforeEach(() => {
        cy.setToInitialState()
            .then(() => {
                return cy.fixture('product-properties.json')
            })
            .then((productProperties) => {
                cy.createProductFixture(productProperties)
                    .then(() => {
                        cy.visit('/');
                        cy.get('.cookie-permission-container .btn-primary').contains('Configure').click();
                        cy.get('.offcanvas .btn-primary').contains('Save').click();
                    });
            });
    });

    it('@visual, @properties: Display Properties', () => {
        // verify in storefront
        cy.visit('/ProductProperties/TEST');

        cy.get('.product-detail-properties-table').should('be.visible');
        cy.get('.product-detail-properties-table').contains('Height')
        cy.get('.product-detail-properties-table').contains('Textile:')
        cy.get('.product-detail-properties-table').contains('Color')

        cy.takeSnapshot('[Product Detail] Properties', '.product-detail-properties');
    });
});
