/**
 * Dashboard Tests (SW-DSH-TC01..TC04)
 * =============================================================================
 * The Dashboard reads computed KPIs from GET /stats. TC01-TC03 assert against
 * the real mock-API response; TC04 uses cy.intercept to force an error state
 * (error guessing) — proving the UI degrades gracefully.
 */
import DashboardPage from "../../pageObjects/DashboardPage";

describe("Dashboard", () => {
  const dashboard = new DashboardPage();

  beforeEach(() => {
    cy.appSession();
  });

  it("SW-DSH-TC01: shows the product and low-stock KPIs @smoke", () => {
    dashboard.visit();
    dashboard.verifyProducts(6).verifyLowStock(2);
  });

  it("SW-DSH-TC02: shows at least one order and a formatted revenue", () => {
    dashboard.visit();
    dashboard.verifyOrdersAtLeast(1).verifyRevenueFormatted();
  });

  it("SW-DSH-TC03: derives low-stock from a stubbed /stats payload @regression", () => {
    cy.intercept("GET", "**/stats", {
      statusCode: 200,
      body: { products: 10, lowStock: 4, orders: 3, revenue: 999.0 },
    }).as("stats");
    dashboard.visit();
    cy.wait("@stats");
    dashboard.verifyProducts(10).verifyLowStock(4);
  });

  it("SW-DSH-TC04: surfaces an error when /stats fails", () => {
    cy.intercept("GET", "**/stats", { statusCode: 500, body: {} }).as("statsFail");
    dashboard.visit();
    cy.wait("@statsFail");
    cy.get("[data-test='dashboard-error']").should("contain", "Failed to load");
  });
});
