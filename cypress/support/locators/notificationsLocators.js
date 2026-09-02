// Notification bell, popover and category filter selectors.
const notificationsLocators = {
  bell: () => cy.get("[data-test='notif-bell']"),
  badge: () => cy.get("[data-test='notif-badge']"),
  popover: () => cy.get("[data-test='notif-popover']"),
  items: () => cy.get("[data-test='notif-item']"),
  filters: () => cy.get("[data-test='notif-filter']"),
  filterBy: (category) => cy.get(`[data-test='notif-filter'][data-category='${category}']`),
  markAll: () => cy.get("[data-test='notif-mark-all']"),
  empty: () => cy.get("[data-test='notif-empty']"),
  error: () => cy.get("[data-test='notif-error']"),
};

export default notificationsLocators;
