import AccountPageObject from '../../../support/pages/account.page-object';

describe('Account: Overview page', () => {
    beforeEach(() => {
        return cy.setToInitialState()
            .then(() => {
                return cy.createCustomerFixtureStorefront();
            })
            .then(() => {
                cy.visit('/');
            }).then(() => {
                cy.get('.js-cookie-configuration-button > .btn').should('be.visible').click();
                cy.get('.offcanvas-cookie > .btn').scrollIntoView().should('be.visible').click();
            });
    });

    it('@visual: Overview page', () => {
        const accountPage = new AccountPageObject();

        cy.visit('/account/login');
        cy.get(accountPage.elements.loginCard).should('be.visible');

        accountPage.login();

        cy.get('.account-welcome h1').should((element) => {
            expect(element).to.contain('Overview');
        });

        cy.takeSnapshot('[Account] Overview page', '.account');

        cy.get('.account-overview-profile').should('be.visible');
        cy.get('.account-overview-newsletter').should('be.visible');
        cy.get('#newsletterRegister').should('not.be.visible')
            .check({ force: true })
            .should('be.checked');

        cy.get('.newsletter-alerts').should((element) => {
            expect(element).to.contain('We have sent a confirmation email containing an activation link. Please check your inbox and click the link to complete your newsletter subscription');
        });

        cy.takeSnapshot('[Overview] Newsletter subscription', '.account-overview');

        cy.get('.overview-billing-address [data-address-editor="true"]').click();
        cy.get('.address-editor-modal').should('be.visible');

        cy.takeSnapshot('[Overview] Billing Address Editor Modal', '.address-editor-modal');

        cy.get('.address-editor-edit').click();
        cy.get(accountPage.elements.editModal).should('have.class', 'show');
        cy.get(accountPage.elements.createModal).should('not.have.class', 'show');

        cy.takeSnapshot('[Overview] Change billing address form', '.address-editor-modal');

        cy.get('.address-editor-create').click();
        cy.get(accountPage.elements.createModal).should('have.class', 'show');
        cy.get(accountPage.elements.editModal).should('not.have.class', 'show');

        cy.takeSnapshot('[Overview] Create a new billing address form', '.address-editor-modal');

        cy.get('.address-editor-modal').find('.modal-close').click();

        // shipping address
        cy.get('.overview-shipping-address [data-address-editor="true"]').click();
        cy.get('.address-editor-modal').should('be.visible');

        cy.takeSnapshot('[Overview] Shipping Address Editor Modal', '.address-editor-modal');

        cy.get('.address-editor-edit').click();
        cy.get(accountPage.elements.shippingEditModal).should('have.class', 'show');
        cy.get(accountPage.elements.shippingCreateModal).should('not.have.class', 'show');

        cy.takeSnapshot('[Overview] Change shipping address form', '.address-editor-modal');

        cy.get('.address-editor-create').click();
        cy.get(accountPage.elements.shippingCreateModal).should('have.class', 'show');
        cy.get(accountPage.elements.shippingEditModal).should('not.have.class', 'show');

        cy.takeSnapshot('[Overview] Create a new shipping address form', '.address-editor-modal');
    });
});
