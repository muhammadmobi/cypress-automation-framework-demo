/**
 * Orders API Tests (SW-ORD-API-TC01..TC05)
 * =============================================================================
 * Backend:  ShopWise mock API — {API_BASE_URL}/orders
 *   GET/POST/DELETE — writes bearer-guarded.
 *
 * Mirror of the UI checkout flow (Cart/CheckoutTests). Authenticated,
 * self-reverting create→delete; negative-auth contract.
 */
describe("Orders API", () => {
  const apiUrl = Cypress.env("API_BASE_URL");
  let token;
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  before(() => {
    cy.apiLogin().then((t) => (token = t));
  });

  it("SW-ORD-API-TC01: GET /orders returns the seed list @smoke", () => {
    cy.request(`${apiUrl}/orders`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  it("SW-ORD-API-TC02: each order exposes reference, total and status", () => {
    cy.request(`${apiUrl}/orders`).then((res) => {
      res.body.forEach((o) => expect(o).to.include.all.keys("reference", "total", "status"));
    });
  });

  it("SW-ORD-API-TC03: POST without a token is rejected with 401 @regression", () => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/orders`,
      body: { reference: "SO-NOAUTH", total: 1, status: "fulfilled" },
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 401);
  });

  it("SW-ORD-API-TC04: authenticated create→read→delete round-trip (self-reverting) @smoke", () => {
    const draft = {
      reference: `SO-${Date.now()}`,
      customer: "API Test",
      total: 42.5,
      status: "fulfilled",
    };
    cy.request({
      method: "POST",
      url: `${apiUrl}/orders`,
      headers: authHeaders(),
      body: draft,
    }).then((created) => {
      expect(created.status).to.be.oneOf([200, 201]);
      const id = created.body.id;
      cy.request(`${apiUrl}/orders/${id}`).its("body.reference").should("eq", draft.reference);
      cy.request({ method: "DELETE", url: `${apiUrl}/orders/${id}`, headers: authHeaders() })
        .its("status")
        .should("eq", 200);
      cy.request({ url: `${apiUrl}/orders/${id}`, failOnStatusCode: false })
        .its("status")
        .should("eq", 404);
    });
  });

  it("SW-ORD-API-TC05: a created order is discoverable in the list, then cleaned up", () => {
    const draft = {
      reference: `SO-LIST-${Date.now()}`,
      customer: "API Test",
      total: 10,
      status: "pending",
    };
    cy.request({
      method: "POST",
      url: `${apiUrl}/orders`,
      headers: authHeaders(),
      body: draft,
    }).then((created) => {
      cy.request(`${apiUrl}/orders`).then((list) => {
        expect(list.body.some((o) => o.reference === draft.reference)).to.be.true;
      });
      cy.request({
        method: "DELETE",
        url: `${apiUrl}/orders/${created.body.id}`,
        headers: authHeaders(),
      });
    });
  });
});
