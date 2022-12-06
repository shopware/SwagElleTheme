import AccountPageObject from '../../../support/pages/account.page-object';

describe('Account: Overview page', {tags: ['@workflow', '@account']}, () => {
    beforeEach(() => {
        return cy.setToInitialState()
            .then(() => {
                return cy.createCustomerFixtureStorefront()
            })
            .then(() => {
                cy.visit('/account/login');
            })
    });

    it.skip('@workflow @account: account overview workflow', () => {
        const page = new AccountPageObject();

        cy.get(page.elements.loginCard).should('be.visible');

        cy.get('#loginMail').typeAndCheckStorefront('pep-erroni-for-testing@example.com');
        cy.get('#loginPassword').typeAndCheckStorefront('shopware');
        cy.get(`${page.elements.loginSubmit} [type="submit"]`).click();

        cy.get('.account-welcome h1').should((element) => {
            expect(element).to.contain('Overview');
        });

        cy.get('.account-overview-profile').should('be.visible');
        cy.get('.account-overview-newsletter').should('be.visible');
        cy.get('#newsletterRegister').should('not.be.visible')
            .check({force: true})
            .should('be.checked');

        cy.get('.newsletter-alerts').should((element) => {
            expect(element).to.contain('You have subscribed to the newsletter');
        });

        // billing address
        cy.get('.overview-billing-address [data-address-editor="true"]').click();
        cy.get('.address-editor-modal').should('be.visible');

        cy.get('.address-editor-edit').click();
        cy.get(page.elements.editModal).should('have.class', 'show');
        cy.get(page.elements.createModal).should('not.have.class', 'show');

        cy.get('.address-editor-create').click();
        cy.get(page.elements.createModal).should('have.class', 'show');
        cy.get(page.elements.editModal).should('not.have.class', 'show');
        cy.get('.address-editor-modal').find('.btn-close').click();

        // shipping address
        cy.get('.overview-shipping-address [data-address-editor="true"]').click();
        cy.get('.address-editor-modal').should('be.visible');

        cy.get('.address-editor-edit').click();
        cy.get(page.elements.shippingEditModal).should('have.class', 'show');
        cy.get(page.elements.shippingCreateModal).should('not.have.class', 'show');

        cy.get('.address-editor-create').click();
        cy.get(page.elements.shippingCreateModal).should('have.class', 'show');
        cy.get(page.elements.shippingEditModal).should('not.have.class', 'show');
    });
});
