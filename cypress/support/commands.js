import LoginPage from "../pageObjects/LoginPage";
import "@testing-library/cypress/add-commands";
import "cypress-mochawesome-reporter/register";

/**
 * cy.login() — UI login using the credentials from cypress env
 * (email/pass). Mirrors the original framework's custom-command pattern.
 */
Cypress.Commands.add("login", (username, password) => {
  const user = username ?? Cypress.env("email");
  const pass = password ?? Cypress.env("pass");
  const loginPage = new LoginPage();
  loginPage.visit().login(user, pass);
  cy.url().should("include", "/inventory");
});

/**
 * cy.appSession() — cached login via cy.session so each spec authenticates
 * once. The validate() block re-checks the persisted session is still valid.
 */
Cypress.Commands.add("appSession", (username, password) => {
  const user = username ?? Cypress.env("email");
  const pass = password ?? Cypress.env("pass");
  cy.session(
    ["app-session", user],
    () => {
      cy.login(user, pass);
    },
    {
      validate() {
        cy.window().then((win) => {
          expect(win.localStorage.getItem("shopwise.session")).to.not.be.null;
        });
      },
    }
  );
});

/**
 * cy.apiLogin() — obtain a bearer token from the mock API. Returns the token
 * so API specs can chain it: cy.apiLogin().then(token => ...).
 */
Cypress.Commands.add("apiLogin", (username, password) => {
  const user = username ?? Cypress.env("email");
  const pass = password ?? Cypress.env("pass");
  return cy
    .request({
      method: "POST",
      url: `${Cypress.env("IDENTITY_SERVER_BASE_URL")}/auth/login`,
      body: { username: user, password: pass },
    })
    .its("body.accessToken");
});
