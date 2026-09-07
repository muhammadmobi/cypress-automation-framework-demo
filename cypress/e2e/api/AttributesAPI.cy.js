/**
 * API — /attributes (SW-API-ATTR-01..06)
 * =============================================================================
 * Self-reverting CRUD: anything this spec creates it deletes again, so the mock
 * database is byte-identical before and after a run.
 */
describe("API — attributes", () => {
  const API = Cypress.env("API_BASE_URL");
  let token;

  before(() => {
    cy.apiLogin().then((t) => {
      token = t;
    });
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it("SW-API-ATTR-01: lists the seeded attributes @smoke", () => {
    cy.request(`${API}/attributes`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array").and.have.length.at.least(3);
      expect(res.body[0]).to.include.keys("id", "name", "type", "required", "values");
    });
  });

  it("SW-API-ATTR-02: rejects a write without a bearer token @smoke", () => {
    cy.request({
      method: "POST",
      url: `${API}/attributes`,
      body: { name: "Nope", type: "text" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("SW-API-ATTR-03: creates and deletes an attribute @smoke", () => {
    const name = `Cy API ${Date.now()}`;
    cy.request({
      method: "POST",
      url: `${API}/attributes`,
      headers: auth(),
      body: { name, type: "text", required: false, values: [] },
    })
      .then((res) => {
        expect(res.status).to.be.oneOf([200, 201]);
        expect(res.body.name).to.eq(name);
        return cy.request({
          method: "DELETE",
          url: `${API}/attributes/${res.body.id}`,
          headers: auth(),
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
      });
  });
  
  
  });
