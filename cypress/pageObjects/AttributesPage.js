import attributesLocators from "../support/locators/attributesLocators";

/** Page Object for the Attributes admin screen. */
class AttributesPage {
  visit() {
    cy.visit("/attributes.html");
    return this;
  }

  fill({ name, type, required, values }) {
    if (name !== undefined) {
      attributesLocators.name().clear();
      if (name) attributesLocators.name().type(name);
    }
    if (type !== undefined) attributesLocators.type().select(type);
    if (required) attributesLocators.required().check();
    if (values !== undefined) {
      attributesLocators.values().clear();
      if (values) attributesLocators.values().type(values);
    }
    return this;
  }

  submit() {
    attributesLocators.submit().click();
    return this;
  }

  create(attr) {
    return this.fill(attr).submit();
  }

  editByName(name) {
    attributesLocators.rowByName(name).find("[data-test='attr-edit']").click();
    return this;
  }

  deleteByName(name) {
    attributesLocators.rowByName(name).find("[data-test='attr-delete']").click();
    return this;
  }

  verifyRowCount(n) {
    attributesLocators.rows().should("have.length", n);
    return this;
  }

  verifyHasAttribute(name) {
    attributesLocators.rowByName(name).should("exist");
    return this;
  }

  verifyNoAttribute(name) {
    attributesLocators.table().should("not.contain", name);
    return this;
  }

  verifyError(message) {
    attributesLocators.error().should("be.visible").and("contain", message);
    return this;
  }

  verifyValuesFieldHidden() {
    attributesLocators.values().parent().should("not.be.visible");
    return this;
  }

  verifyValuesFieldVisible() {
    attributesLocators.values().should("be.visible");
    return this;
  }
}

export default AttributesPage;
