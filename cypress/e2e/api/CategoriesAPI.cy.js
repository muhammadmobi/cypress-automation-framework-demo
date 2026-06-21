/**
 * Categories API Tests (SW-CAT-API-TC01..TC06)
 * =============================================================================
 * Backend:  ShopWise mock API — {API_BASE_URL}/categories
 *   GET/POST/PATCH/DELETE — writes bearer-guarded.
 *
 * Authenticated, self-reverting CRUD plus negative-auth and unknown-id contract.
 */
describe("Categories API", () => {
  const apiUrl = Cypress.env("API_BASE_URL");
  let token;
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  before(() => {
    cy.apiLogin().then((t) => (token = t));
  });

  it("SW-CAT-API-TC01: GET /categories returns the seed list @smoke", () => {
    cy.request(`${apiUrl}/categories`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array").and.have.length.greaterThan(0);
    });
  });

  it("SW-CAT-API-TC02: each category exposes id, name and slug", () => {
    cy.request(`${apiUrl}/categories`).then((res) => {
      res.body.forEach((c) => expect(c).to.include.all.keys("id", "name", "slug"));
    });
  });

  it("SW-CAT-API-TC03: GET an unknown id returns 404 @regression", () => {
    cy.request({ url: `${apiUrl}/categories/999999`, failOnStatusCode: false })
      .its("status")
      .should("eq", 404);
  });

  it("SW-CAT-API-TC04: POST without a token is rejected with 401 @regression", () => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/categories`,
      body: { name: "no-auth", slug: "no-auth" },
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 401);
  });

  it("SW-CAT-API-TC05: authenticated create→read→delete round-trip (self-reverting) @smoke", () => {
    const draft = { name: "Conveyors", slug: "conveyors" };
    cy.request({
      method: "POST",
      url: `${apiUrl}/categories`,
      headers: authHeaders(),
      body: draft,
    }).then((created) => {
      expect(created.status).to.be.oneOf([200, 201]);
      const id = created.body.id;
      cy.request(`${apiUrl}/categories/${id}`).its("body.name").should("eq", draft.name);
      cy.request({ method: "DELETE", url: `${apiUrl}/categories/${id}`, headers: authHeaders() })
        .its("status")
        .should("eq", 200);
      cy.request({ url: `${apiUrl}/categories/${id}`, failOnStatusCode: false })
        .its("status")
        .should("eq", 404);
    });
  });

  it("SW-CAT-API-TC06: PATCH renames a category, then restores it (self-reverting)", () => {
    cy.request(`${apiUrl}/categories/1`).then((original) => {
      cy.request({
        method: "PATCH",
        url: `${apiUrl}/categories/1`,
        headers: authHeaders(),
        body: { name: "Renamed Cat" },
      })
        .its("body.name")
        .should("eq", "Renamed Cat");
      cy.request({
        method: "PATCH",
        url: `${apiUrl}/categories/1`,
        headers: authHeaders(),
        body: { name: original.body.name },
      })
        .its("body.name")
        .should("eq", original.body.name);
    });
  });
});
