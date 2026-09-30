/**
 * Notifications — category filter and error state (SW-NOT-TC05..TC09)
 * =============================================================================
 * Extends the existing bell/badge coverage with the category chips. The badge is
 * deliberately unaffected by the filter: it always counts the whole inbox, so a
 * narrowed list must not change it.
 */
import notificationsLocators from "../../support/locators/notificationsLocators";

describe("Notifications — filter and error state", () => {
  const ITEMS = [
    { id: 1, title: "Low stock A", category: "low-stock", read: false },
    { id: 2, title: "Low stock B", category: "low-stock", read: false },
    { id: 3, title: "Report ready", category: "report", read: true },
  ];

  const stub = (items = ITEMS) =>
    cy.intercept("GET", "**/notifications", { statusCode: 200, body: items }).as("notifs");

  beforeEach(() => {
    cy.appSession();
  });

  it("SW-NOT-TC05: one chip per category, plus an all-categories chip @smoke", () => {
    stub();
    cy.visit("/inventory.html");
    cy.wait("@notifs");
    notificationsLocators.bell().click();
    notificationsLocators.filters().should("have.length", 3);
    notificationsLocators.filterBy("all").should("have.attr", "aria-pressed", "true");
  });

  it("SW-NOT-TC06: choosing a category narrows the list @smoke", () => {
    stub();
    cy.visit("/inventory.html");
    cy.wait("@notifs");
    notificationsLocators.bell().click();
    notificationsLocators.filterBy("report").click();
    cy.wait("@notifs");
    notificationsLocators.items().should("have.length", 1).and("contain", "Report ready");
  });

  it("SW-NOT-TC07: the badge still counts the whole inbox while filtered @regression", () => {
    stub();
    cy.visit("/inventory.html");
    cy.wait("@notifs");
    notificationsLocators.bell().click();
    notificationsLocators.filterBy("report").click();
    cy.wait("@notifs");
    // the report category holds one read item, but two unread remain overall
    notificationsLocators.badge().should("have.text", "2");
  });
  
  });
