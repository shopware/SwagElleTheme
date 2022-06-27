describe('Product: Add to card in product detail', {tags: ['@workflow', '@product']}, () => {
    beforeEach(() => {
        cy.setToInitialState()
            .then(() => {
                return cy.fixture('product-properties.json')
            })
            .then((productProperties) => {
                cy.createProductFixture(productProperties)
                    .then(() => {
                        cy.visit('/ProductProperties/TEST');
                    });
            });
    });

    it('@workflow @product: Add to cart in product detail follow', () => {
        cy.get('.btn-buy').click();
        cy.get('.cart-offcanvas').should('have.class', 'is-open');
        cy.get('.offcanvas-cart .alert-success').should('be.visible')

        cy.get('.cart-offcanvas .js-offcanvas-close').click()
        cy.get('.header-cart-badge').contains('1');
    });
});
