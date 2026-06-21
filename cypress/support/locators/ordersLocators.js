// Orders screen selectors.
const ordersLocators = {
  table: () => cy.get("[data-test='orders-table']"),
  rows: () => cy.get("[data-test='order-row']"),
  reference: () => cy.get("[data-test='order-ref']"),
  status: () => cy.get("[data-test='order-status']"),
  empty: () => cy.get("[data-test='orders-empty']"),
};

export default ordersLocators;
