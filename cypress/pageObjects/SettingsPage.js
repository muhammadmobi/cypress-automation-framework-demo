import settingsLocators from "../support/locators/settingsLocators";

/** Page Object for the Settings screen. */
class SettingsPage {
  visit() {
    cy.visit("/settings.html");
    return this;
  }
  selectDefaultSort(value) {
    settingsLocators.defaultSort().select(value);
    return this;
  }
  save() {
    settingsLocators.save().click();
    return this;
  }
  verifySaved() {
    settingsLocators.saved().should("contain", "saved");
    return this;
  }
  verifyDefaultSort(value) {
    settingsLocators.defaultSort().should("have.value", value);
    return this;
  }
}

export default SettingsPage;
