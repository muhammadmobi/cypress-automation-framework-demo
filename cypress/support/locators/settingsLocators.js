// Settings screen selectors.
const settingsLocators = {
  form: () => cy.get("[data-test='settings-form']"),
  defaultSort: () => cy.get("[data-test='setting-default-sort']"),
  save: () => cy.get("[data-test='save-settings']"),
  saved: () => cy.get("[data-test='settings-saved']"),
};

export default settingsLocators;
