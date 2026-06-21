/**
 * Notifications — Bell & Badge (SW-NOT-TC01..TC04)
 * =============================================================================
 * Fully stub-driven via cy.intercept (mirrors the production framework's
 * stub-first Notifications module). Every test pins GET /notifications to a
 * known payload so badge counts and list rendering are deterministic and never
 * mutate server state.
 */
describe("Notifications — Bell & Badge", () => {
  const stub = (items) =>
    cy.intercept("GET", "**/notifications", { statusCode: 200, body: items }).as("notifs");

  beforeEach(() => {
    cy.appSession();
  });

  it("SW-NOT-TC01: the bell badge shows the unread count @smoke", () => {
    stub([
      { id: 1, title: "Low stock A", category: "low-stock", read: false },
      { id: 2, title: "Low stock B", category: "low-stock", read: false },
      { id: 3, title: "Report ready", category: "report", read: true },
    ]);
    cy.visit("/inventory.html");
    cy.wait("@notifs");
    cy.get("[data-test='notif-badge']").should("be.visible").and("have.text", "2");
  });

  it("SW-NOT-TC02: opening the bell lists every notification", () => {
    stub([
      { id: 1, title: "Low stock A", category: "low-stock", read: false },
      { id: 2, title: "Report ready", category: "report", read: true },
    ]);
    cy.visit("/inventory.html");
    cy.wait("@notifs");
    cy.get("[data-test='notif-bell']").click();
    cy.get("[data-test='notif-item']").should("have.length", 2);
  });

  it("SW-NOT-TC03: an all-read inbox hides the badge @regression", () => {
    stub([{ id: 1, title: "Report ready", category: "report", read: true }]);
    cy.visit("/inventory.html");
    cy.wait("@notifs");
    cy.get("[data-test='notif-badge']").should("not.be.visible");
  });

  it("SW-NOT-TC04: an empty inbox shows the empty state", () => {
    stub([]);
    cy.visit("/inventory.html");
    cy.wait("@notifs");
    cy.get("[data-test='notif-bell']").click();
    cy.get("[data-test='notif-empty']").should("be.visible");
  });
});
