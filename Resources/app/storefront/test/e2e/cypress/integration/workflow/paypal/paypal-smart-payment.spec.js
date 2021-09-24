import AccountPageObject from '../../../support/pages/account.page-object';

const accountPage = new AccountPageObject();
let salesChannelId;
let product = {};

describe('Paypal: Checkout', () => {
    before(() => {
        return cy.setToInitialState()
            .then(() => {
                // Search for storefront SalesChannel id
                return cy.searchViaAdminApi({
                    endpoint: 'sales-channel',
                    data: {
                        field: 'name',
                        value: 'Storefront'
                    }
                });
            })
            .then((salesChannelData) => {
                // Preserve salesChannelId for later use
                salesChannelId = salesChannelData.id;
                return cy.initializePluginConfig('paypal-config.json', `/api/_action/system-config/batch`)
            })
            .then(() => {
                return cy.requestAdminApi(
                    'POST',
                    `/api/_action/paypal/saleschannel-default`,
                    {"salesChannelId": salesChannelId}
                )
            })
            .then(() => {
                return cy.createProductFixture();
            })
            .then(() => {
                return cy.fixture('product');
            })
            .then((result) => {
                product = result;
            })
            .then(() => {
              return cy.createCustomerFixtureStorefront();
            })
    });

    it('@workflow @paypal: should display smart payment on the footer', () => {
        cy.intercept({
            path: '/api/_action/system-config/batch',
            method: 'POST'
        }).as('saveConfig')

        cy.loginViaApi();
        cy.visit('/admin#/swag/paypal/index');

        const merchantSelector = '.swag-paypal-settings-behavior-field > :nth-child(1) > .sw-single-select'
        cy.get(merchantSelector)
            .scrollIntoView()
            .typeSingleSelect('Other merchant location', merchantSelector);

        cy.get(':nth-child(5) > .sw-card__title')
            .scrollIntoView()
            .should('be.visible').contains('PayPal Checkout with Smart Payment Buttons')
        cy.get('.swag-paypal-settings-spb-fields > :nth-child(1) > .sw-field--switch input[type="checkbox"]').check();
        cy.get('.smart-bar__actions > .sw-button').click();

        cy.wait('@saveConfig');

        // visit on Storefront
        cy.visit('/');

        // verify on footer
        cy.get('div[data-swag-paypal-marks="true"] .paypal-logo-card').should('be.visible');
    });

    it('@workflow @paypal: should be able to checkout using smart payment', () => {
        cy.visit('/');

        cy.createCustomerFixtureStorefront();

        cy.get('.search-toggle-btn').click();
        cy.get('.header-search-input')
            .type(product.name);
        cy.get('.search-suggest-product-name').contains(product.name);
        cy.get('.search-suggest-product-name').click();

        cy.get('.product-detail-buy .btn-buy').click();

        // Offcanvas
        cy.get('.offcanvas').should('be.visible');
        cy.get('.offcanvas-cart-actions .begin-checkout-btn').click();

        // Login
        cy.get('.register-login-collapse-toogle .login-collapse-toggle').click();
        accountPage.login();

        // Confirm: Change payment method to "Paypal"
        cy.get('.paypal-marks').click();
        cy.get('div[data-swag-paypal-marks="true"] .paypal-logo-card').should('be.visible');
    })
})
