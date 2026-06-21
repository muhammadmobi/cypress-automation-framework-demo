/**
 * Products API Tests (SW-PROD-API-TC01..TC09)
 * =============================================================================
 * Backend:  ShopWise mock API — {API_BASE_URL}/products
 *   GET    /products            list
 *   GET    /products/:id        read
 *   POST   /products            create   (bearer-guarded)
 *   PATCH  /products/:id        update   (bearer-guarded)
 *   DELETE /products/:id        delete   (bearer-guarded)
 *
 * Demonstrates: authenticated CRUD, a SELF-REVERTING create→delete test so the
 * dataset is left untouched, negative auth (401 without token), and contract /
 * schema-shape assertions. Token is fetched once via cy.apiLogin().
 */
describe("Products API", () => {
  const apiUrl = Cypress.env("API_BASE_URL");
  let token;

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  before(() => {
    cy.apiLogin().then((t) => (token = t));
  });

  it("SW-PROD-API-TC01: GET /products returns the seed list @smoke", () => {
    cy.request(`${apiUrl}/products`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array").and.have.length.greaterThan(0);
    });
  });

  it("SW-PROD-API-TC02: each product matches the expected schema shape", () => {
    cy.request(`${apiUrl}/products`).then((res) => {
      res.body.forEach((p) => {
        expect(p).to.include.all.keys("id", "name", "price", "sku", "stock");
        expect(p.price).to.be.a("number");
        expect(p.stock).to.be.a("number");
      });
    });
  });

  it("SW-PROD-API-TC03: GET /products/:id returns a single product", () => {
    cy.request(`${apiUrl}/products/1`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("id", 1);
    });
  });

  it("SW-PROD-API-TC04: GET an unknown id returns 404 @regression", () => {
    cy.request({ url: `${apiUrl}/products/999999`, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it("SW-PROD-API-TC05: POST without a token is rejected with 401 @regression", () => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/products`,
      body: { name: "no-auth", price: 1, sku: "NA", stock: 1 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("SW-PROD-API-TC06: authenticated create→read→delete round-trip (self-reverting) @smoke", () => {
    const draft = { name: "Forklift Battery", price: 459.0, sku: "FB-900", stock: 4 };
    cy.request({
      method: "POST",
      url: `${apiUrl}/products`,
      headers: authHeaders(),
      body: draft,
    }).then((created) => {
      expect(created.status).to.be.oneOf([200, 201]);
      const id = created.body.id;
      expect(created.body).to.include({ name: draft.name, sku: draft.sku });

      cy.request(`${apiUrl}/products/${id}`).its("body.name").should("eq", draft.name);

      // revert
      cy.request({ method: "DELETE", url: `${apiUrl}/products/${id}`, headers: authHeaders() })
        .its("status")
        .should("eq", 200);
      cy.request({ url: `${apiUrl}/products/${id}`, failOnStatusCode: false })
        .its("status")
        .should("eq", 404);
    });
  });

  it("SW-PROD-API-TC07: PATCH updates a field, then restores it (self-reverting)", () => {
    cy.request(`${apiUrl}/products/2`).then((original) => {
      const newStock = original.body.stock + 5;
      cy.request({
        method: "PATCH",
        url: `${apiUrl}/products/2`,
        headers: authHeaders(),
        body: { stock: newStock },
      })
        .its("body.stock")
        .should("eq", newStock);

      // restore original value
      cy.request({
        method: "PATCH",
        url: `${apiUrl}/products/2`,
        headers: authHeaders(),
        body: { stock: original.body.stock },
      })
        .its("body.stock")
        .should("eq", original.body.stock);
    });
  });

  it("SW-PROD-API-TC08: DELETE without a token is rejected with 401", () => {
    cy.request({ method: "DELETE", url: `${apiUrl}/products/1`, failOnStatusCode: false }).then(
      (res) => {
        expect(res.status).to.eq(401);
      }
    );
  });

  it("SW-PROD-API-TC09: PUT replaces a product, then restores it (self-reverting)", () => {
    cy.request(`${apiUrl}/products/3`).then((original) => {
      const replaced = { ...original.body, price: original.body.price + 100 };
      cy.request({
        method: "PUT",
        url: `${apiUrl}/products/3`,
        headers: authHeaders(),
        body: replaced,
      })
        .its("body.price")
        .should("eq", replaced.price);

      // restore the original representation
      cy.request({
        method: "PUT",
        url: `${apiUrl}/products/3`,
        headers: authHeaders(),
        body: original.body,
      })
        .its("body.price")
        .should("eq", original.body.price);
    });
  });
});
