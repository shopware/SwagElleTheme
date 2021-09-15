import AccountPageObject from '../../../support/pages/account.page-object';

const accountPage = new AccountPageObject();
const productLink = '/Product-name/RS-333'
let salesChannelId;
let product = {};

describe('Paypal: Checkout', () => {
    beforeEach(() => {
        return cy.setToInitialState()
            .then(() => {
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
                cy.visit('/');
            })
    });

    it('@workflow @paypal: should see Paypal logo in footer', () => {
        cy.get('.footer-logos div[data-swag-paypal-installment-banner="true"]')
            .should('be.visible');
    });

    it('@workflow @paypal: should be visible in product box', () => {
        cy.get('.paypal-buttons').first().should('be.exist').click({force: true});
    });

    it('@workflow @paypal: should have Paypal checkout button for default settings', () => {
        // Product detail
        cy.visit(productLink);

        cy.get('h1.product-detail-name').contains('Product name');
        cy.get('div[data-swag-paypal-express-button="true"]').scrollIntoView().should('be.visible');
    });

    it('@workflow @paypal: should have Paypal checkout button in Offcanvas cart', () => {
        cy.get('.product-box .btn-buy').first().should('be.exist').click({force: true});

        cy.get('.offcanvas-cart div[data-swag-paypal-express-button="true"]').should('be.visible');
        cy.get('.offcanvas-cart div[data-swag-paypal-installment-banner="true"]').should('be.visible');
    });

    it('@workflow @paypal: should have Paypal checkout in checkout register page', () => {
        cy.visit(productLink);
        cy.get('.product-detail-buy .btn-buy').click();

        // Offcanvas
        cy.get('.offcanvas').should('be.visible');
        cy.get('.offcanvas-cart-actions .begin-checkout-btn').click();

        // Checkout register Paypal
        cy.get('.paypal-buttons').should('be.exist').click({force: true});
        cy.get('[data-swag-paypal-installment-banner="true"]').should('be.exist');
    });

    it('@workflow @paypal: should have Paypal checkout in checkout cart page', () => {
        cy.visit(productLink);
        cy.get('.product-detail-buy .btn-buy').click();

        // Offcanvas
        cy.get('.offcanvas').should('be.visible');
        cy.get('.offcanvas-cart-actions a[href="/checkout/cart"]').click();

        cy.get('div[data-swag-paypal-installment-banner="true"]').should('be.visible');
        cy.get('div[data-swag-paypal-express-button="true"]').scrollIntoView().should('be.visible');
    });

    it('@workflow @paypal: should be able to checkout using Paypal as payment method', () => {
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

        // Change payment method to "Paypal"
        cy.get('.payment-methods .payment-method-label')
            .should('exist')
            .contains('PayPal, direct debit or credit card')
            .click(1, 1);
        cy.get('#ppplus').should('be.visible');
    });
});
