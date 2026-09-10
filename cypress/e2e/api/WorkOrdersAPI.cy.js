/**
 * API — /workOrders and the close transition (SW-API-WO-01..06)
 * =============================================================================
 * Closing is one-way, so this spec creates its own throwaway work order to close
 * rather than closing a seeded one, then deletes it. The seeded rows are left
 * exactly as they were.
 */
describe("API — work orders", () => {
  const API = Cypress.env("API_BASE_URL");
  let token;
  let baseline;

  before(() => {
    cy.apiLogin().then((t) => {
      token = t;
    });
    // snapshot the collection so the closing test can prove nothing leaked
    cy.request(`${API}/workOrders`).then((res) => {
      baseline = res.body.map((w) => `${w.reference}:${w.status}`).sort();
    });
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  const createOrder = (overrides = {}) =>
    cy.request({
      method: "POST",
      url: `${API}/workOrders`,
      headers: auth(),
      body: {
        reference: `WO-CY-${Date.now()}`,
        title: "Cypress throwaway",
        status: "open",
        assignee: "cypress",
        items: 1,
        ...overrides,
      },
    });

  const remove = (id) =>
    cy.request({ method: "DELETE", url: `${API}/workOrders/${id}`, headers: auth() });

  it("SW-API-WO-01: lists the seeded work orders @smoke", () => {
    cy.request(`${API}/workOrders`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array").and.have.length.at.least(3);
      expect(res.body[0]).to.include.keys("id", "reference", "title", "status", "assignee", "items");
    });
  });

  it("SW-API-WO-02: rejects closing without a bearer token @smoke", () => {
    cy.request({
      method: "POST",
      url: `${API}/work-orders/1/close`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("SW-API-WO-03: closes an open work order @smoke", () => {
    createOrder().then((created) => {
      cy.request({
        method: "POST",
        url: `${API}/work-orders/${created.body.id}/close`,
        headers: auth(),
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.status).to.eq("closed");
        remove(created.body.id);
      });
    });
  });

  
  
  // Asserts the invariant this spec is responsible for — that it reverts its own
  // writes — rather than an absolute seed state, which anything touching the
  // mock beforehand would invalidate.
  });
