describe('Product: Check product search follow', {tags: ['@workflow', '@product']}, () => {
    beforeEach(() => {
        cy.setToInitialState()
            .then(() => {
                return cy.fixture('product-properties.json')
            })
            .then((productProperties) => {
                cy.createProductFixture(productProperties)
            })
            .then(() => {
                cy.visit('/');
            });
    });

    it('@workflow @product: Product can be search and accessible', () => {
        // verify in storefront
        cy.get('.js-search-toggle-btn').click();
        cy.get('.header-search-input').type('ProductProperties')
        cy.wait(2000)

        cy.get('.search-suggest-product').should('be.visible');
        cy.get('.search-suggest-product').click();
        cy.url().should('include', 'ProductProperties')
    });
});
