/**
 * Work Orders — closing (SW-WO-TC07..TC10)
 * =============================================================================
 * The close transition is stubbed rather than real, so no run ever leaves a work
 * order closed for the next one.
 */
import WorkOrdersPage from "../../pageObjects/WorkOrdersPage";
import workOrdersLocators from "../../support/locators/workOrdersLocators";

describe("Work Orders — closing", () => {
  const page = new WorkOrdersPage();

  const openOrder = {
    id: 1, reference: "WO-1001", title: "Restock keyboards",
    status: "open", assignee: "dana", items: 12,
  };
  const closedOrder = { ...openOrder, status: "closed" };

  const listOnce = (rows) =>
    cy.intercept("GET", "**/workOrders", { statusCode: 200, body: rows }).as("workOrders");

  beforeEach(() => {
    cy.appSession();
  });

  it("SW-WO-TC07: closing an open order updates its status @smoke", () => {
    // the screen reloads after closing, so the second GET must reflect the change
    let served = 0;
    cy.intercept("GET", "**/workOrders", (req) => {
      served += 1;
      req.reply({ statusCode: 200, body: [served === 1 ? openOrder : closedOrder] });
    }).as("workOrders");
    cy.intercept("POST", "**/work-orders/1/close", { statusCode: 200, body: closedOrder }).as("close");

    page.visit();
    cy.wait("@workOrders");
    page.closeByRef("WO-1001");
    cy.wait("@close");
    page.verifyNotice("Work order closed.");
    page.verifyStatusOf("WO-1001", "closed");
  });

  it("SW-WO-TC08: a closed order offers no close button @regression", () => {
    listOnce([closedOrder]);
    page.visit();
    cy.wait("@workOrders");
    page.verifyNoCloseButtonFor("WO-1001");
  });

  it("SW-WO-TC09: a 409 explains the order is already closed @regression", () => {
    listOnce([openOrder]);
    cy.intercept("POST", "**/work-orders/1/close", {
      statusCode: 409,
      body: { message: "Work order is already closed" },
    }).as("close");

    page.visit();
    cy.wait("@workOrders");
    page.closeByRef("WO-1001");
    cy.wait("@close");
    page.verifyNotice("already closed");
  });

  it("SW-WO-TC10: a server error surfaces and re-enables the button", () => {
    listOnce([openOrder]);
    cy.intercept("POST", "**/work-orders/1/close", { statusCode: 500, body: {} }).as("close");

    page.visit();
    cy.wait("@workOrders");
    page.closeByRef("WO-1001");
    cy.wait("@close");
    page.verifyNotice("Could not close");
    workOrdersLocators.closeButton().should("not.be.disabled");
  });
});
