import dashboardLocators from "../support/locators/dashboardLocators";

/** Page Object for the Dashboard KPI screen. */
class DashboardPage {
  visit() {
    cy.visit("/dashboard.html");
    return this;
  }
  verifyProducts(count) {
    dashboardLocators.products().should("have.text", String(count));
    return this;
  }
  verifyLowStock(count) {
    dashboardLocators.lowStock().should("have.text", String(count));
    return this;
  }
  verifyOrdersAtLeast(min) {
    // .should() retries until the async /stats fetch has populated the cell.
    dashboardLocators.orders().should(($el) => {
      expect(Number($el.text())).to.be.at.least(min);
    });
    return this;
  }
  verifyRevenueFormatted() {
    dashboardLocators
      .revenue()
      .invoke("text")
      .should("match", /^\$\d+\.\d{2}$/);
    return this;
  }
}

export default DashboardPage;
