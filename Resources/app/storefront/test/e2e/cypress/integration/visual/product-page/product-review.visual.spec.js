import ProductPageObject from '../../../support/pages/sw-product.page-object';

describe('Product Detail: Visual tests review area', () => {
    beforeEach(() => {
        cy.setToInitialState()
            .then(() => {
                cy.loginViaApi();
            })
            .then(() => {
                return cy.createProductFixture();
            })
            .then(() => {
                return cy.createCustomerFixtureStorefront();
            })
            .then(() => {
                cy.visit('/Product-name/RS-333');
                cy.get('.cookie-permission-container .btn-primary').contains('Configure').click();
                cy.get('.offcanvas .btn-primary').contains('Save').click();
            });
    });

    it('@visual, @review: Display review tab with no review', () => {
        cy.get('#review-tab').click();
        cy.get('.product-detail-review-teaser-btn').should('be.visible');
        cy.get('.product-detail-review-list').contains('No reviews found');

        cy.takeSnapshot('[Product Detail] No review', '.product-detail-information');
    });

    it('@visual, @review: User post review', () => {
        cy.get('#review-tab').click();
        cy.get('.product-detail-review-teaser button').click();
        cy.get('.product-detail-review-login').should('be.visible');

        cy.get('#loginMail').typeAndCheckStorefront('pep-erroni-for-testing@example.com');
        cy.get('#loginPassword').typeAndCheckStorefront('shopware');
        cy.get('.login-submit [type="submit"]').click();

        cy.visit('/Product-name/RS-333');
        cy.get('#review-tab').click();
        cy.get('.product-detail-review-teaser button').click();

        cy.takeSnapshot('[Product Detail] Post review form layout', '.product-detail-information');

        cy.get('#reviewTitle').type('Review title Review title Review title Review title Review title');
        cy.get('#reviewContent').type('Review content'.repeat(10));
        cy.get('.product-detail-review-form-actions button').click();
        cy.changeElementStyling('.product-detail-review-item-date', 'visibility:hidden');
        cy.get('.product-detail-review-list-content').should('be.visible');

        cy.takeSnapshot('[Product Detail] Post review result', '.product-detail-information');
    });

    it('@visual, @review: Display available review', () => {
        cy.createReviewFixture();
        cy.openInitialPage(`${Cypress.env('admin')}#/sw/product/index`);

        const page = new ProductPageObject();
        // Request we want to wait for later

        cy.intercept({
            path: `${Cypress.env('apiPath')}/product-review/*`,
            method: 'patch'
        }).as('saveData');

        cy.clickContextMenuItem(
            '.sw-entity-listing__context-menu-edit-action',
            page.elements.contextMenuButton,
            `${page.elements.dataGridRow}--0`
        );

        cy.get('.sw-product-detail__tab-reviews').click();
        cy.get(page.elements.loader).should('not.exist');

        cy.get('.sw-data-grid__table .sw-data-grid__row--0 .sw-data-grid__cell-value').click()
        cy.get('.sw-field--switch__content [type="checkbox"]').click()

        cy.get('.sw-review-detail__save-action').click();
        cy.wait('@saveData').then((xhr) => {
            expect(xhr.response).to.have.property('statusCode', 204);
        });
        cy.get('.sw-loader').should('not.exist');

        //Verify product's review in Storefront
        cy.visit('/Product-name/RS-333');
        cy.get('#review-tab').click();
        cy.get('.product-detail-review-language label').click();
        cy.get('.product-detail-review-language-form input').should('be.checked')
        cy.get('.product-detail-review-rating').should('be.visible');
        cy.get('.product-detail-review-item').should('be.visible');
        cy.changeElementStyling('.product-detail-review-item-date', 'visibility:hidden');
        cy.wait(1000);
        cy.takeSnapshot('[Product Detail] Product review', '.product-detail-information');
    });
});
