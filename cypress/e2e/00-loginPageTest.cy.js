/**
 * Login UI Tests (SW-AUTH-TC01..TC09)
 * =============================================================================
 * Target:  ShopWise demo app — index.html
 * Mirror:  cypress/e2e/api/AuthAPI.cy.js
 *
 * UI rendering, client-side required-field validation, invalid credentials,
 * a locked-out user (error guessing), the happy path, session, and logout.
 * Data comes from fixtures; actions go through the LoginPage page object.
 */
import LoginPage from "../pageObjects/LoginPage";

describe("Login Page", () => {
  const loginPage = new LoginPage();
  let users;
  let loginData;

  before(() => {
    cy.fixture("users").then((u) => (users = u));
    cy.fixture("loginPageData").then((d) => (loginData = d));
  });

  beforeEach(() => {
    loginPage.visit();
  });

  it("SW-AUTH-TC01: renders the Sign in button @smoke", () => {
    loginPage.verifyLoginButton(loginData.buttons.signIn);
  });

  it("SW-AUTH-TC02: shows a required error when username is empty", () => {
    loginPage.enterPassword(users.admin.password).submit();
    loginPage.verifyError(loginData.errors.usernameRequired);
  });

  it("SW-AUTH-TC03: shows a required error when password is empty", () => {
    loginPage.enterUsername(users.admin.username).submit();
    loginPage.verifyError(loginData.errors.passwordRequired);
  });

  it("SW-AUTH-TC04: rejects an unknown username @regression", () => {
    loginPage.login(users.invalid.username, users.admin.password);
    loginPage.verifyError(loginData.errors.invalidCredentials);
  });

  it("SW-AUTH-TC05: rejects a wrong password @regression", () => {
    loginPage.login(users.admin.username, users.invalid.password);
    loginPage.verifyError(loginData.errors.invalidCredentials);
  });

  it("SW-AUTH-TC06: blocks a locked-out user", () => {
    loginPage.login(users.locked.username, users.locked.password);
    loginPage.verifyError(loginData.errors.lockedOut);
  });

  it("SW-AUTH-TC07: logs in with valid credentials @smoke", () => {
    loginPage.login(users.admin.username, users.admin.password);
    cy.url().should("include", loginData.routes.inventory);
    cy.get("[data-test='inventory-grid']").should("be.visible");
  });

  it("SW-AUTH-TC08: persists the session in localStorage", () => {
    loginPage.login(users.admin.username, users.admin.password);
    cy.window().then((win) => {
      expect(win.localStorage.getItem("shopwise.session")).to.not.be.null;
    });
  });

  it("SW-AUTH-TC09: logout returns the user to the login screen", () => {
    loginPage.login(users.admin.username, users.admin.password);
    cy.get("[data-test='logout']").click();
    cy.url().should("include", "index.html");
    cy.get("[data-test='login-form']").should("be.visible");
  });
});
