// Reports screen selectors.
const reportsLocators = {
  table: () => cy.get("[data-test='reports-table']"),
  rows: () => cy.get("[data-test='report-row']"),
  category: () => cy.get("[data-test='report-category']"),
  error: () => cy.get("[data-test='reports-error']"),
};

export default reportsLocators;
