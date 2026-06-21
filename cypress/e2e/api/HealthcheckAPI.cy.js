/**
 * Healthcheck API Tests (SW-HC-API-TC01..TC02)
 * =============================================================================
 * GET {API_BASE_URL}/health — public liveness probe (works without auth).
 */
describe("Healthcheck API", () => {
  const apiUrl = Cypress.env("API_BASE_URL");

  it("SW-HC-API-TC01: GET /health returns 200 and status ok @smoke", () => {
    cy.request(`${apiUrl}/health`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("status", "ok");
    });
  });

  it("SW-HC-API-TC02: /health requires no authentication", () => {
    cy.request({ url: `${apiUrl}/health`, failOnStatusCode: false })
      .its("status")
      .should("eq", 200);
  });
});
