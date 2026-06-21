// Shared top-navigation + notifications bell selectors (rendered on every
// authenticated page by app.js into [data-test='app-header']).
const navLocators = {
  header: () => cy.get("[data-test='app-header']"),
  inventory: () => cy.get("[data-test='nav-inventory']"),
  dashboard: () => cy.get("[data-test='nav-dashboard']"),
  orders: () => cy.get("[data-test='nav-orders']"),
  reports: () => cy.get("[data-test='nav-reports']"),
  settings: () => cy.get("[data-test='nav-settings']"),
  cartLink: () => cy.get("[data-test='cart-link']"),
  logout: () => cy.get("[data-test='logout']"),
  // notifications bell
  bell: () => cy.get("[data-test='notif-bell']"),
  badge: () => cy.get("[data-test='notif-badge']"),
  popover: () => cy.get("[data-test='notif-popover']"),
  notifItems: () => cy.get("[data-test='notif-item']"),
  markAll: () => cy.get("[data-test='notif-mark-all']"),
  empty: () => cy.get("[data-test='notif-empty']"),
};

export default navLocators;
