// Attributes admin selectors.
const attributesLocators = {
  form: () => cy.get("[data-test='attr-form']"),
  name: () => cy.get("[data-test='attr-name']"),
  type: () => cy.get("[data-test='attr-type']"),
  required: () => cy.get("[data-test='attr-required']"),
  values: () => cy.get("[data-test='attr-values']"),
  error: () => cy.get("[data-test='attr-error']"),
  submit: () => cy.get("[data-test='attr-submit']"),
  cancel: () => cy.get("[data-test='attr-cancel']"),
  table: () => cy.get("[data-test='attr-table']"),
  rows: () => cy.get("[data-test='attr-row']"),
  rowByName: (name) => cy.contains("[data-test='attr-row']", name),
  empty: () => cy.get("[data-test='attr-empty']"),
  loadError: () => cy.get("[data-test='attr-load-error']"),
};

export default attributesLocators;
