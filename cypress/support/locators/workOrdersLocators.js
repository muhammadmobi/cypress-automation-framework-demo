// Work Orders screen selectors.
const workOrdersLocators = {
  status: () => cy.get("[data-test='wo-status']"),
  search: () => cy.get("[data-test='wo-search']"),
  count: () => cy.get("[data-test='wo-count']"),
  notice: () => cy.get("[data-test='wo-notice']"),
  list: () => cy.get("[data-test='wo-list']"),
  rows: () => cy.get("[data-test='wo-row']"),
  rowByRef: (ref) => cy.contains("[data-test='wo-row']", ref),
  statusPill: () => cy.get("[data-test='wo-status-pill']"),
  closeButton: () => cy.get("[data-test='wo-close']"),
  empty: () => cy.get("[data-test='wo-empty']"),
  loadError: () => cy.get("[data-test='wo-load-error']"),
};

export default workOrdersLocators;
