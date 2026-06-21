/**
 * Notifications API Tests (SW-NOT-API-TC01..TC05)
 * =============================================================================
 * Backend:  ShopWise mock API
 *   GET   {API_BASE_URL}/notifications          (public read)
 *   PATCH {API_BASE_URL}/notifications/:id       (bearer-guarded)
 *   PATCH {API_BASE_URL}/notifications/read-all   (bearer-guarded bulk)
 * Mirror:   cypress/e2e/Notifications/*.cy.js (UI, stub-driven)
 *
 * The mark-all mutation is self-reverting — it captures each notification's
 * original read flag and restores it in a trailing cy.then so the seed inbox
 * (2 unread) is intact for the UI specs.
 */
describe("Notifications API", () => {
  const apiUrl = Cypress.env("API_BASE_URL");
  let token;
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  before(() => {
    cy.apiLogin().then((t) => (token = t));
  });

  it("SW-NOT-API-TC01: GET /notifications returns the inbox @smoke", () => {
    cy.request(`${apiUrl}/notifications`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array").and.have.length.greaterThan(0);
    });
  });

  it("SW-NOT-API-TC02: at least one notification is unread in the seed inbox", () => {
    cy.request(`${apiUrl}/notifications`).then((res) => {
      expect(res.body.some((n) => n.read === false)).to.be.true;
    });
  });

  it("SW-NOT-API-TC03: PATCH /read-all without a token is rejected with 401 @regression", () => {
    cy.request({
      method: "PATCH",
      url: `${apiUrl}/notifications/read-all`,
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 401);
  });

  it("SW-NOT-API-TC04: authenticated mark-all sets every notification read (self-reverting) @smoke", () => {
    cy.request(`${apiUrl}/notifications`).then((before) => {
      const original = before.body.map((n) => ({ id: n.id, read: n.read }));

      cy.request({
        method: "PATCH",
        url: `${apiUrl}/notifications/read-all`,
        headers: authHeaders(),
      })
        .its("status")
        .should("eq", 200);

      cy.request(`${apiUrl}/notifications`).then((after) => {
        expect(after.body.every((n) => n.read === true)).to.be.true;
      });

      // restore original read flags
      cy.then(() => {
        original.forEach((n) =>
          cy.request({
            method: "PATCH",
            url: `${apiUrl}/notifications/${n.id}`,
            headers: authHeaders(),
            body: { read: n.read },
          })
        );
      });
    });
  });

  it("SW-NOT-API-TC05: after restore, the inbox still has an unread item", () => {
    cy.request(`${apiUrl}/notifications`)
      .its("body")
      .should((items) => {
        expect(items.some((n) => n.read === false)).to.be.true;
      });
  });
});
