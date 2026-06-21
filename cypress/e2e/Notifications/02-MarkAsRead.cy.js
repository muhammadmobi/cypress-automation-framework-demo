/**
 * Notifications — Mark as Read (SW-NOT-TC05..TC06)
 * =============================================================================
 * Stub-driven state transition: an inbox with unread items → "Mark all read"
 * → badge clears. Both GET /notifications and PATCH /notifications/read-all are
 * intercepted so the test is deterministic and side-effect free.
 */
describe("Notifications — Mark as Read", () => {
  beforeEach(() => {
    cy.appSession();
  });

  it("SW-NOT-TC05: 'Mark all read' clears the unread badge @regression", () => {
    const unread = [
      { id: 1, title: "Low stock A", category: "low-stock", read: false },
      { id: 2, title: "Low stock B", category: "low-stock", read: false },
    ];
    const allRead = unread.map((n) => ({ ...n, read: true }));

    // First GET returns unread; after the PATCH, GET returns all-read.
    let marked = false;
    cy.intercept("GET", "**/notifications", (req) => {
      req.reply({ statusCode: 200, body: marked ? allRead : unread });
    }).as("notifs");
    cy.intercept("PATCH", "**/notifications/read-all", (req) => {
      marked = true;
      req.reply({ statusCode: 200, body: { updated: 2 } });
    }).as("markAll");

    cy.visit("/inventory.html");
    cy.wait("@notifs");
    cy.get("[data-test='notif-badge']").should("have.text", "2");

    cy.get("[data-test='notif-bell']").click();
    cy.get("[data-test='notif-mark-all']").click();
    cy.wait("@markAll");
    cy.get("[data-test='notif-badge']").should("not.be.visible");
  });

  it("SW-NOT-TC06: the mark-all request carries a bearer token", () => {
    cy.intercept("GET", "**/notifications", {
      statusCode: 200,
      body: [{ id: 1, title: "Low stock A", category: "low-stock", read: false }],
    }).as("notifs");
    cy.intercept("PATCH", "**/notifications/read-all", {
      statusCode: 200,
      body: { updated: 1 },
    }).as("markAll");

    cy.visit("/inventory.html");
    cy.wait("@notifs");
    cy.get("[data-test='notif-bell']").click();
    cy.get("[data-test='notif-mark-all']").click();
    cy.wait("@markAll").its("request.headers.authorization").should("contain", "Bearer");
  });
});
