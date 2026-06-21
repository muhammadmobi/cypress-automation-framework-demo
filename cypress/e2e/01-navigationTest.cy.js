/**
 * Navigation Tests (SW-NAV-TC01..TC06)
 * =============================================================================
 * Target:  ShopWise shared top navigation (rendered on every authed page).
 *
 * Verifies each nav destination is reachable from the bar. Login is cached via
 * cy.appSession so navigation is exercised without re-authenticating each test.
 */
import NavBar from "../pageObjects/NavBar";

describe("Navigation", () => {
  const nav = new NavBar();

  beforeEach(() => {
    cy.appSession();
    cy.visit("/inventory.html");
  });

  it("SW-NAV-TC01: navigates to the Dashboard @smoke", () => {
    nav.goToDashboard();
    cy.url().should("include", "dashboard.html");
    cy.get("[data-test='dashboard']").should("be.visible");
  });

  it("SW-NAV-TC02: navigates to Orders", () => {
    nav.goToOrders();
    cy.url().should("include", "orders.html");
    cy.get("[data-test='orders-table']").should("be.visible");
  });

  it("SW-NAV-TC03: navigates to Reports", () => {
    nav.goToReports();
    cy.url().should("include", "reports.html");
    cy.get("[data-test='reports-table']").should("be.visible");
  });

  it("SW-NAV-TC04: navigates to Settings", () => {
    nav.goToSettings();
    cy.url().should("include", "settings.html");
    cy.get("[data-test='settings-form']").should("be.visible");
  });

  it("SW-NAV-TC05: navigates to the Cart", () => {
    nav.goToCart();
    cy.url().should("include", "cart.html");
  });

  it("SW-NAV-TC06: the nav bar exposes every primary destination @regression", () => {
    [
      "nav-inventory",
      "nav-dashboard",
      "nav-orders",
      "nav-reports",
      "nav-settings",
      "cart-link",
    ].forEach((link) => cy.get(`[data-test='${link}']`).should("be.visible"));
  });
});
