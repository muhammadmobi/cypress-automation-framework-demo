/**
 * Reports Tests (SW-RPT-TC01..TC03)
 * =============================================================================
 * The Reports screen renders a category breakdown from GET /reports/summary.
 * TC01-TC02 assert the real response; TC03 stubs the payload to prove the table
 * renders an arbitrary row set deterministically.
 */
import reportsLocators from "../../support/locators/reportsLocators";

describe("Reports", () => {
  beforeEach(() => {
    cy.appSession();
  });

  it("SW-RPT-TC01: renders one row per category @smoke", () => {
    cy.visit("/reports.html");
    reportsLocators.rows().should("have.length", 3);
  });

  it("SW-RPT-TC02: includes the Storage & Shelving category", () => {
    cy.visit("/reports.html");
    reportsLocators.category().should("contain", "Storage & Shelving");
  });

  it("SW-RPT-TC03: renders a stubbed report payload @regression", () => {
    cy.intercept("GET", "**/reports/summary", {
      statusCode: 200,
      body: {
        rows: [{ category: "Demo Cat", productCount: 2, totalStock: 50, stockValue: 1234.5 }],
      },
    }).as("report");
    cy.visit("/reports.html");
    cy.wait("@report");
    reportsLocators.rows().should("have.length", 1);
    reportsLocators.category().should("have.text", "Demo Cat");
  });
});
