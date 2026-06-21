/**
 * Auth API Tests (SW-AUTH-API-TC01..TC08)
 * =============================================================================
 * Backend:  ShopWise mock API
 *   POST {IDENTITY_SERVER_BASE_URL}/auth/login    { username, password }
 *   POST {IDENTITY_SERVER_BASE_URL}/auth/refresh  { refreshToken }
 *   GET  {API_BASE_URL}/health
 * Mirror:   cypress/e2e/ui/01-login.cy.js
 *
 * Pattern (faithful to the original framework): pure-API via cy.request,
 * failOnStatusCode:false so negative paths assert status codes instead of
 * throwing, token reused against a protected endpoint as a usability proof.
 */
describe("Auth API", () => {
  let users;
  const identityUrl = Cypress.env("IDENTITY_SERVER_BASE_URL");
  const apiUrl = Cypress.env("API_BASE_URL");

  const loginRequest = (body) =>
    cy.request({
      method: "POST",
      url: `${identityUrl}/auth/login`,
      body,
      failOnStatusCode: false,
    });

  before(() => {
    cy.fixture("users").then((u) => (users = u));
  });

  it("SW-AUTH-API-TC01: health endpoint is up @smoke", () => {
    cy.request(`${apiUrl}/health`).its("body.status").should("eq", "ok");
  });

  it("SW-AUTH-API-TC02: valid credentials return 200 with tokens @smoke", () => {
    loginRequest({ username: users.admin.username, password: users.admin.password }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("accessToken").that.is.a("string").and.not.empty;
      expect(res.body).to.have.property("refreshToken").that.is.a("string").and.not.empty;
      expect(res.body).to.have.property("username", users.admin.username);
    });
  });

  it("SW-AUTH-API-TC03: response exposes role=admin", () => {
    loginRequest({ username: users.admin.username, password: users.admin.password }).then((res) => {
      expect(String(res.body.role).toLowerCase()).to.eq("admin");
    });
  });

  it("SW-AUTH-API-TC04: the access token is accepted by a protected endpoint", () => {
    loginRequest({ username: users.admin.username, password: users.admin.password }).then((res) => {
      const token = res.body.accessToken;
      cy.request({
        method: "POST",
        url: `${apiUrl}/products`,
        headers: { Authorization: `Bearer ${token}` },
        body: { name: "auth-probe", price: 1, sku: "PROBE", stock: 0 },
      }).then((created) => {
        expect(created.status).to.be.oneOf([200, 201]);
        // self-revert: remove the probe row
        cy.request({
          method: "DELETE",
          url: `${apiUrl}/products/${created.body.id}`,
          headers: { Authorization: `Bearer ${token}` },
        });
      });
    });
  });

  it("SW-AUTH-API-TC05: unknown username returns 401 @regression", () => {
    loginRequest({ username: users.invalid.username, password: users.admin.password }).then(
      (res) => {
        expect(res.status).to.eq(401);
        expect(String(res.body.message).toLowerCase()).to.contain("invalid");
      }
    );
  });

  it("SW-AUTH-API-TC06: wrong password returns 401 @regression", () => {
    loginRequest({ username: users.admin.username, password: users.invalid.password }).then(
      (res) => {
        expect(res.status).to.eq(401);
      }
    );
  });

  it("SW-AUTH-API-TC07: missing password is rejected with 4xx", () => {
    loginRequest({ username: users.admin.username }).then((res) => {
      expect(res.status).to.be.oneOf([400, 401, 422]);
    });
  });

  it("SW-AUTH-API-TC08: refresh token exchange returns a fresh access token", () => {
    loginRequest({ username: users.admin.username, password: users.admin.password }).then((res) => {
      cy.request({
        method: "POST",
        url: `${identityUrl}/auth/refresh`,
        body: { refreshToken: res.body.refreshToken },
        failOnStatusCode: false,
      }).then((refresh) => {
        expect(refresh.status).to.eq(200);
        expect(refresh.body.accessToken).to.be.a("string").and.not.empty;
      });
    });
  });
});
