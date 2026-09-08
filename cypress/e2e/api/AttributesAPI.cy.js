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

  it("SW-API-ATTR-04: patches an attribute and reverts it @regression", () => {
    let created;
    cy.request({
      method: "POST",
      url: `${API}/attributes`,
      headers: auth(),
      body: { name: `Cy Patch ${Date.now()}`, type: "text", required: false, values: [] },
    })
      .then((res) => {
        created = res.body;
        return cy.request({
          method: "PATCH",
          url: `${API}/attributes/${created.id}`,
          headers: auth(),
          body: { required: true },
        });
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.required).to.eq(true);
        return cy.request({
          method: "DELETE",
          url: `${API}/attributes/${created.id}`,
          headers: auth(),
        });
      });
  });

  it("SW-API-ATTR-05: stores the value list of a list attribute @regression", () => {
    const values = ["Matte", "Gloss"];
    cy.request({
      method: "POST",
      url: `${API}/attributes`,
      headers: auth(),
      body: { name: `Cy List ${Date.now()}`, type: "list", required: false, values },
    })
      .then((res) => {
        expect(res.body.values).to.deep.eq(values);
        return cy.request({
          method: "DELETE",
          url: `${API}/attributes/${res.body.id}`,
          headers: auth(),
        });
      });
  });

  it("SW-API-ATTR-06: returns 404 for an attribute that does not exist", () => {
    cy.request({ url: `${API}/attributes/999999`, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });
});
