export default class AccountPageObject {
    constructor() {
        this.elements = {
            // Register - Login
            registerCard: '.register-card',
            registerForm: '.register-form',
            registerSubmit: '.register-submit',
            registerCheckbox: '.register-different-shipping input',
            loginCard: '.login-card',
            loginForm: '.login-form',
            loginSubmit: '.login-submit',
        };
    }

    getEmail() {
        return cy.get('#loginMail')
    }

    getPassword() {
        return cy.get('#loginPassword')
    }

    getSubmitButton() {
        return cy.get(`${this.elements.loginSubmit} [type="submit"]`)
    }

    login(email = 'pep-erroni-for-testing@example.com', pw = 'shopware') {
        this.getEmail().type(email)
        this.getPassword().type(pw)
        this.getSubmitButton().click()
    }
}
