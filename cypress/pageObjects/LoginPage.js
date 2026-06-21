import loginLocators from "../support/locators/loginLocators";

/**
 * Page Object for the ShopWise login screen.
 * Exposes intent-revealing actions/assertions; selectors live in loginLocators.
 */
class LoginPage {
  visit() {
    cy.visit("/");
    return this;
  }

  enterUsername(username) {
    loginLocators.usernameField().clear();
    if (username) loginLocators.usernameField().type(username);
    return this;
  }

  enterPassword(password) {
    loginLocators.passwordField().clear();
    if (password) loginLocators.passwordField().type(password, { log: false });
    return this;
  }

  submit() {
    loginLocators.loginButton().click();
    return this;
  }

  login(username, password) {
    this.enterUsername(username);
    this.enterPassword(password);
    this.submit();
    return this;
  }

  verifyError(expectedMessage) {
    loginLocators.errorMessage().should("be.visible").and("contain", expectedMessage);
    return this;
  }

  verifyLoginButton(expectedText) {
    loginLocators.loginButton().should("be.visible").and("contain", expectedText);
    return this;
  }
}

export default LoginPage;
