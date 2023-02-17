import ProductPageObject from '../../../support/pages/sw-product.page-object';

describe('Product Detail: Visual tests price area', () => {
    beforeEach(() => {
        cy.setToInitialState()
            .then(() => {
                cy.login();
            })
            .then(() => {
                return cy.createProductFixture();
            })
            .then(() => {
                cy.visit('/Product-name/RS-333');
                cy.get('.cookie-permission-container .btn-primary').contains('Configure').click();
                cy.get('.offcanvas .btn-primary').contains('Save').click();
            });
    });

    it('@visual, @price: Normal Price', () => {
        cy.visit('/Product-name/RS-333');
        cy.get('.product-detail-price').should('be.visible');
        cy.get('.product-block-prices').should('not.exist');
        cy.get('.product-detail-price').should('not.contain', 'From');
        cy.get('.product-detail-price').should('contain','€10.51*');

        cy.takeSnapshot('[Product Detail] Normal Price', '.is-ctl-product');
    });

    it('@visual, @price: List price', () => {
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

        cy.get('.sw-product-detail__tab-advanced-prices').click();
        cy.get(page.elements.loader).should('not.exist');

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

        //Verify product's advanced price in Storefront
        cy.visit('/Product-name/RS-333');
        cy.get('.product-block-prices').should('be.visible');
        cy.get('.product-block-prices-table').contains('Unit price');
        cy.get('.product-block-prices-body').contains('From');
        cy.takeSnapshot('[Product Detail] Advanced prices list', '.is-ctl-product');
    });
});
