/**
 * Reports API Tests (SW-RPT-API-TC01..TC05)
 * =============================================================================
 * Backend:  ShopWise mock API (public computed reads)
 *   GET {API_BASE_URL}/stats            dashboard KPIs
 *   GET {API_BASE_URL}/reports/summary   per-category stock breakdown
 * Mirror:   cypress/e2e/Dashboard/*.cy.js, cypress/e2e/Reports/*.cy.js
 *
 * Contract / schema-shape assertions on the computed endpoints.
 */
describe("Reports API", () => {
  const apiUrl = Cypress.env("API_BASE_URL");

  it("SW-RPT-API-TC01: GET /stats returns the KPI shape @smoke", () => {
    cy.request(`${apiUrl}/stats`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.include.all.keys("products", "lowStock", "orders", "revenue");
      expect(res.body.products).to.be.a("number");
    });
  });

  it("SW-RPT-API-TC02: low-stock count is never greater than the product count", () => {
    cy.request(`${apiUrl}/stats`).then((res) => {
      expect(res.body.lowStock).to.be.at.most(res.body.products);
    });
  });

  it("SW-RPT-API-TC03: GET /reports/summary returns one row per category @smoke", () => {
    cy.request(`${apiUrl}/reports/summary`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.rows).to.be.an("array").and.have.length(3);
    });
  });

  it("SW-RPT-API-TC04: each report row has the expected metrics", () => {
    cy.request(`${apiUrl}/reports/summary`).then((res) => {
      res.body.rows.forEach((r) => {
        expect(r).to.include.all.keys("category", "productCount", "totalStock", "stockValue");
        expect(r.productCount).to.be.a("number");
      });
    });
  });

  it("SW-RPT-API-TC05: total products across report rows matches the catalog @regression", () => {
    cy.request(`${apiUrl}/products`).then((products) => {
      cy.request(`${apiUrl}/reports/summary`).then((report) => {
        const summed = report.body.rows.reduce((s, r) => s + r.productCount, 0);
        expect(summed).to.eq(products.body.length);
      });
    });
  });
});
