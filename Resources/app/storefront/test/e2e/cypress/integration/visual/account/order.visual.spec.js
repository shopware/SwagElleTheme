import AccountPageObject from '../../../support/pages/account.page-object';

let product = {};
const accountPage = new AccountPageObject();

describe('Account: Order page', () => {
    beforeEach(() => {
        return cy.setToInitialState()
            .then(() => cy.setShippingMethodInSalesChannel('Standard'))
            .then(() => cy.createProductFixture())
            .then(() => cy.fixture('product'))
            .then((result) => {
                product = result;
                return cy.createCustomerFixtureStorefront();
            })
            .then(() => {
                return cy.searchViaAdminApi({
                    endpoint: 'product',
                    data: {
                        field: 'name',
                        value: 'Product name'
                    }
                });
            })
            .then((result) => {
                return cy.createOrder(result.id, {
                    username: 'pep-erroni-for-testing@example.com',
                    password: 'shopware'
                });
            })
            .then(() => {
                return cy.exec(`${Cypress.env('shopwareRoot')}/bin/console cache:clear`)
                    .its('code').should('eq', 0);
            })
            .then(() => cy.visit('/'))
            .then(() => {
                cy.get('.js-cookie-configuration-button > .btn').should('be.visible').click();
                cy.get('.offcanvas-cookie > .btn').scrollIntoView().should('be.visible').click();
            });
    });

    it('@visual: reorder order', () => {
        // Login
        cy.visit('/account/order');
        accountPage.login();

        cy.changeElementStyling('.order-table-header-heading', 'display: none');

        // Order detail is expandable
        cy.get('.order-table').should('be.visible');
        cy.get('.order-table:nth-of-type(1) .order-table-header-order-number').contains('Order number: 10000');
        cy.takeSnapshot('[Order] Order table', '.order-table');

        cy.get('.order-table:nth-of-type(1) .order-hide-btn').click();
        cy.get('.order-detail-content').should('be.visible');

        cy.changeElementStyling('.order-item-detail-labels-value:nth-of-type(1)', 'visibility: hidden');
        cy.takeSnapshot('[Order] Order Details', '.order-table');

        // Re-order past order
        cy.get('.order-table-header-context-menu').click();
        cy.get('.order-table-header-context-menu-content-form').should('be.visible');
        cy.takeSnapshot('[Order] Order form actions', '.order-table');

        cy.get('.order-table-header-context-menu-content-form button').click();
        cy.get('.cart-offcanvas').should('be.visible');
        cy.get('.cart-offcanvas .alert-content').contains('1 product has been added to the shopping cart.');
        cy.takeSnapshot('[Order] Re-order - Add product to shopping cart', '.container');

        cy.get('.begin-checkout-btn').click();
        cy.get('.checkout').should('be.visible');
        cy.get('.confirm-main-header').contains('Complete order');
        cy.takeSnapshot('[Order] Re-order - Confirm order page', '.checkout');

        cy.get('.custom-control.custom-checkbox input').click({force: true});
        cy.get('#confirmFormSubmit').click();

        // Verify order
        cy.get('.finish-header').contains('Thank you for your order');
        cy.get('.finish-ordernumber').contains('Your order number: #10001');
        cy.takeSnapshot('[Order] Re-order - Confirm finish page', '.checkout');
    });

    it('@visual: cancel order', () => {
        // Enable refunds
        cy.loginViaApi().then(() => {
            cy.visit('/admin#/sw/settings/cart/index');
            cy.contains('Enable refunds').click();
            cy.get('.sw-settings-cart__save-action').click();
            cy.get('.icon--regular-checkmark-xs').should('be.visible');
        });

        // Login
        cy.visit('/account/order');
        cy.get('.login-card').should('be.visible');
        accountPage.login();

        cy.get('.order-table-header-context-menu').click();

        cy.get('.dropdown-menu > [type="button"]').click();
        cy.get('.order-history-cancel-modal').should('be.visible');

        cy.get('.order-history-cancel-modal .btn-primary').click();
        cy.get('.order-table-header-order-status.badge').contains('Cancelled');

        cy.changeElementStyling('.order-table-header-heading', 'display: none');
        cy.get('.order-table-header-heading')
            .should('have.css', 'display', 'none');

        cy.takeSnapshot('[Order] Order Cancelled', '.order-table');
    });
});
