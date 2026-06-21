// Centralised element selectors for the Login page.
// Locators are kept separate from page objects so a UI change touches one file.
const loginLocators = {
  usernameField: () => cy.get("[data-test='username']"),
  passwordField: () => cy.get("[data-test='password']"),
  loginButton: () => cy.get("[data-test='login-button']"),
  errorMessage: () => cy.get("[data-test='login-error']"),
  loginForm: () => cy.get("[data-test='login-form']"),
};

export default loginLocators;
