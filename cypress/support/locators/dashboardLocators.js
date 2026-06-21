// Dashboard screen selectors.
const dashboardLocators = {
  root: () => cy.get("[data-test='dashboard']"),
  products: () => cy.get("[data-test='stat-products']"),
  lowStock: () => cy.get("[data-test='stat-lowstock']"),
  orders: () => cy.get("[data-test='stat-orders']"),
  revenue: () => cy.get("[data-test='stat-revenue']"),
  error: () => cy.get("[data-test='dashboard-error']"),
};

export default dashboardLocators;
