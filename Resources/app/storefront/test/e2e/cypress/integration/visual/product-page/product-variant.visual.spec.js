import ProductPageObject from '../../../support/pages/sw-product.page-object';

describe('Product Detail: Visual tests variant feature', () => {
    beforeEach(() => {
        cy.setToInitialState()
            .then(() => {
                cy.login();
            })
            .then(() => {
                cy.createProductVariantFixture();
            })
            .then(() => {
                cy.visit('/');
                cy.get('.cookie-permission-container .btn-primary').contains('Configure').click();
                cy.get('.offcanvas .btn-primary').contains('Save').click();
            });
    });

    it('@visual @variants: Should have Variant product', () => {
        cy.visit(`${Cypress.env('admin')}#/sw/product/index`);
        const page = new ProductPageObject();
        const priceGroup = '.context-price-group';
        const quantityEndCell = '.sw-data-grid__cell--quantityEnd';

        // input values
        const quantityEnd00 = 20;
        const quantityEnd01 = 40;

        cy.intercept({
            path: `${Cypress.env('apiPath')}/_action/sync`,
            method: 'post'
        }).as('saveData');

        cy.clickContextMenuItem(
            '.sw-entity-listing__context-menu-edit-action',
            page.elements.contextMenuButton,
            `${page.elements.dataGridRow}--0`
        );

        cy.get('.sw-product-detail__tab-variants').click();
        cy.get('.sw-data-grid__table .sw-data-grid__row--0 .sw-data-grid__cell--name .sw-product-variants-overview__variation-link').click();
        cy.get(page.elements.loader).should('not.exist');
        cy.get('.sw-inheritance-warning').should('be.visible');
        cy.get('.sw-product-detail__tab-advanced-prices').click();

        cy.get(page.elements.loader).should('not.exist');
        cy.wait(1000);
        cy.get('.sw-inheritance-switch .sw-icon').click();

        cy.get('.sw-product-detail-context-prices__empty-state-select-rule').click();

        cy.get('.sw-select-result .sw-highlight-text').contains('All customers').click();

        // change quantityEnd of first row
        cy.get(`${priceGroup}-0 ${page.elements.dataGridRow}--0 ${quantityEndCell} input`)
            .scrollIntoView()
            .type(`${quantityEnd00}{enter}`);

        // change List price of first row
        cy.get('.sw-data-grid__row--0 .sw-data-grid__cell--price-EUR .sw-list-price-field__list-price #sw-price-field-gross')
            .type('15')
            .type('{enter}');

        // change quantityEnd of second row
        cy.get(`${priceGroup}-0 ${page.elements.dataGridRow}--1 ${quantityEndCell} input`)
            .scrollIntoView()
            .type(`${quantityEnd01}{enter}`);

        // change price of second row
        cy.get('.sw-data-grid__row--1 .sw-data-grid__cell--price-EUR .sw-list-price-field__price #sw-price-field-gross')
            .clear()
            .type('9')
            .type('{enter}');

        // change price of third row
        cy.get('.sw-data-grid__row--2 .sw-data-grid__cell--price-EUR .sw-list-price-field__price #sw-price-field-gross')
            .clear()
            .type('8')
            .type('{enter}');

        cy.get(page.elements.productSaveAction).click();
        cy.wait('@saveData').then((xhr) => {
            expect(xhr.response).to.have.property('statusCode', 200);
        });
        cy.get('.sw-loader').should('not.exist');


        // go to first product
        cy.visit('/Variant-product/TEST.1');
        // check if normal price is correct
        cy.get('.product-detail-price').contains('€110.00*');
        // check if listingPrice/streichpreis is correct
        cy.get('.list-price-price').contains('€120.00');
        cy.takeSnapshot('[Product Detail] Product variant area with normal price', '.product-detail-buy');

        // go to second product
        cy.visit('/Variant-product/TEST.2');
        // check if normal price is correct
        cy.get('.product-detail-price').contains('€110.00*');
        // check if listingPrice/streichpreis is correct
        cy.get('.list-price-price').contains('€120.00');

        // go to third product
        cy.visit('/Variant-product/TEST.7');
        // check if normal price is correct
        cy.get('.product-detail-price').contains('€110.00*');
        cy.takeSnapshot('[Product Detail] Product variant area with advance prices', '.product-detail-buy');
    });
});
