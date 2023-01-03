import ProductStreamObject from '../../../support/pages/sw-product-stream.page-object';

describe('Product Detail: Product', () => {
    beforeEach(() => {
        cy.setToInitialState()
            .then(() => {
                return cy.createProductFixture();
            })
            .then(() => {
                return cy.createDefaultFixture('product-stream', {}, 'product-stream');
            })
            .then(() => {
                return cy.createPropertyFixture({
                    options: [{
                        name: 'Red'
                    }]
                });
            })
            .then(() => {
                cy.loginViaApi();
            })
            .then(() => {
                cy.visit('/');
                cy.get('.cookie-permission-container .btn-primary').contains('Configure').click();
                cy.get('.offcanvas .btn-primary').contains('Save').click();
                cy.openInitialPage(`${Cypress.env('admin')}#/sw/product/index`);
            });
    });

    it('@visual @crossSelling: check appearance of product cross selling workflow', () => {
        const page = new ProductStreamObject();

        // Request we want to wait for later
        cy.intercept({
            path: `${Cypress.env('apiPath')}/_action/sync`,
            method: 'post'
        }).as('saveData');
        cy.intercept({
            path: `${Cypress.env('apiPath')}/search/product-stream`,
            method: 'post'
        }).as('saveStream');

        cy.createProductFixture({
            name: 'Original product',
            productNumber: 'RS-11111',
            description: 'Pudding wafer apple pie fruitcake cupcake.'
        }).then(() => {
            cy.createProductFixture({
                name: 'Second product',
                productNumber: 'RS-22222',
                description: 'Jelly beans jelly-o toffee I love jelly pie tart cupcake topping.'
            });
        }).then(() => {
            cy.createProductFixture({
                name: 'Third product',
                productNumber: 'RS-33333',
                description: 'Cookie bonbon tootsie roll lemon drops soufflé powder gummies bonbon.'
            });
        });

        // Open product and add cross selling
        cy.visit(`${Cypress.env('admin')}#/sw/product/index`);
        cy.get('.sw-product-list-grid').should('be.visible');

        cy.contains('Original product').click();

        cy.get('.sw-product-detail__tab-cross-selling').click();
        cy.get(page.elements.loader).should('not.exist');

        cy.contains(
            `.sw-empty-state .sw-empty-state__actions`,
            'Add new Cross Selling'
        ).should('be.visible').click();
        cy.get('.product-detail-cross-selling-form').should('be.visible');

        // Fill in cross selling form
        cy.get('#sw-field--crossSelling-name').typeAndCheck('Kunden kauften auch');
        cy.get('#sw-field--crossSelling-product-group')
            .typeSingleSelectAndCheck(
                '1st Productstream',
                '#sw-field--crossSelling-product-group'
            );
        cy.get('input[name="sw-field--crossSelling-active"]').click();

        // Save and verify cross selling stream
        cy.get('.sw-button-process').click();
        cy.wait('@saveData').then((xhr) => {
            expect(xhr.response).to.have.property('statusCode', 200);
        });

        // Verify in storefront
        cy.visit('/');
        cy.contains('Original product').click();
        cy.get('.product-detail-name').contains('Original product');

        cy.get('.product-cross-selling-tab-navigation')
            .scrollIntoView()
            .should('be.visible');
        cy.get('.product-detail-tab-navigation-link.active').contains('Kunden kauften auch');
        cy.takeSnapshot('[Product detail] Cross Selling');
    });
})
