import workOrdersLocators from "../support/locators/workOrdersLocators";

/** Page Object for the Work Orders screen. */
class WorkOrdersPage {
  visit() {
    cy.visit("/work-orders.html");
    return this;
  }

  filterByStatus(status) {
    workOrdersLocators.status().select(status);
    return this;
  }

  search(text) {
    workOrdersLocators.search().clear();
    if (text) workOrdersLocators.search().type(text);
    return this;
  }

  closeByRef(ref) {
    workOrdersLocators.rowByRef(ref).find("[data-test='wo-close']").click();
    return this;
  }

  verifyRowCount(n) {
    workOrdersLocators.rows().should("have.length", n);
    return this;
  }

  verifyCountLabel(text) {
    workOrdersLocators.count().should("contain", text);
    return this;
  }

  verifyStatusOf(ref, status) {
    workOrdersLocators.rowByRef(ref).should("have.attr", "data-status", status);
    return this;
  }

  verifyNotice(text) {
    workOrdersLocators.notice().should("be.visible").and("contain", text);
    return this;
  }

  verifyEmptyState() {
    workOrdersLocators.empty().should("be.visible");
    return this;
  }

  verifyNoCloseButtonFor(ref) {
    workOrdersLocators.rowByRef(ref).find("[data-test='wo-close']").should("not.exist");
    return this;
  }
}

export default WorkOrdersPage;
