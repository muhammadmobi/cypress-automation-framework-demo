/**
 * API — POST /chat (SW-API-CHAT-01..05)
 * =============================================================================
 * The assistant is a stub with canned replies keyed by intent. Read-only: the
 * endpoint never mutates the database, so nothing needs reverting.
 */
describe("API — chat", () => {
  const API = Cypress.env("API_BASE_URL");
  let token;

  before(() => {
    cy.apiLogin().then((t) => {
      token = t;
    });
  });

  const ask = (message) =>
    cy.request({
      method: "POST",
      url: `${API}/chat`,
      headers: { Authorization: `Bearer ${token}` },
      body: { message },
      failOnStatusCode: false,
    });

  it("SW-API-CHAT-01: rejects an unauthenticated caller @smoke", () => {
    cy.request({
      method: "POST",
      url: `${API}/chat`,
      body: { message: "hello" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("SW-API-CHAT-02: rejects an empty message @regression", () => {
    ask("   ").then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.contain("required");
    });
  });

  it("SW-API-CHAT-03: answers a low-stock question @smoke", () => {
    ask("What is low on stock?").then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.intent).to.eq("low-stock");
      expect(res.body.reply).to.contain("low-stock threshold");
    });
  });

  it("SW-API-CHAT-04: answers an orders question @regression", () => {
    ask("How many orders?").then((res) => {
      expect(res.body.intent).to.eq("orders");
    });
  });

  it("SW-API-CHAT-05: falls back rather than returning an empty reply", () => {
    ask("qwertyuiop").then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.intent).to.eq("unknown");
      expect(res.body.reply).to.be.a("string").and.not.be.empty;
      expect(res.body.suggestions).to.be.an("array").and.have.length.at.least(1);
    });
  });
});
