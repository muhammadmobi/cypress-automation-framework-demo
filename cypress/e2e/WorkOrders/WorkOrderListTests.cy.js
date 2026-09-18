/**
 * Work Orders — list, filter and search (SW-WO-TC01..TC06)
 * =============================================================================
 * Stub-driven, so the row set is fixed no matter what an earlier spec closed.
 */
import WorkOrdersPage from "../../pageObjects/WorkOrdersPage";
import workOrdersLocators from "../../support/locators/workOrdersLocators";

describe("Work Orders — list", () => {
  const page = new WorkOrdersPage();

  const ROWS = [
    { id: 1, reference: "WO-1001", title: "Restock keyboards", status: "open", assignee: "dana", items: 12 },
    { id: 2, reference: "WO-1002", title: "Audit shelf B", status: "in-progress", assignee: "ravi", items: 40 },
    { id: 3, reference: "WO-1003", title: "Return damaged monitors", status: "closed", assignee: "dana", items: 3 },
  ];

  beforeEach(() => {
    cy.appSession();
    cy.intercept("GET", "**/workOrders", { statusCode: 200, body: ROWS }).as("workOrders");
    page.visit();
    cy.wait("@workOrders");
  });

  it("SW-WO-TC01: every work order is listed @smoke", () => {
    page.verifyRowCount(3).verifyCountLabel("3 work orders");
  });

  it("SW-WO-TC02: the status filter narrows the list @smoke", () => {
    page.filterByStatus("open").verifyRowCount(1);
    workOrdersLocators.rows().should("contain", "WO-1001");
  });

  it("SW-WO-TC03: the closed filter shows only closed orders @regression", () => {
    page.filterByStatus("closed").verifyRowCount(1);
    page.verifyStatusOf("WO-1003", "closed");
  });
  
  
  });
