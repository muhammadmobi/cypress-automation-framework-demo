/**
 * Attributes — CRUD (SW-ATTR-TC06..TC11)
 * =============================================================================
 * Self-reverting: every attribute created here is deleted again inside the same
 * test, so the suite can run repeatedly against the same mock API without
 * leaving residue behind.
 */
import AttributesPage from "../../pageObjects/AttributesPage";
import attributesLocators from "../../support/locators/attributesLocators";

describe("Attributes — CRUD", () => {
  const page = new AttributesPage();
  const unique = () => `Cy Attr ${Date.now()}`;

  beforeEach(() => {
    cy.appSession();
    page.visit();
  });

  it("SW-ATTR-TC06: the seeded attributes are listed @smoke", () => {
    attributesLocators.rows().should("have.length.at.least", 3);
    page.verifyHasAttribute("Colour");
  });

  it("SW-ATTR-TC07: a text attribute can be created and removed @smoke", () => {
    const name = unique();
    page.create({ name, type: "text" });
    page.verifyHasAttribute(name);
    page.deleteByName(name);
    page.verifyNoAttribute(name);
  });

  it("SW-ATTR-TC08: a list attribute keeps its values @regression", () => {
    const name = unique();
    page.create({ name, type: "list", values: "Matte, Gloss" });
    attributesLocators
      .rowByName(name)
      .find("[data-test='attr-row-values']")
      .should("contain", "Matte")
      .and("contain", "Gloss");
    page.deleteByName(name);
  });

  it("SW-ATTR-TC09: the required flag is stored @regression", () => {
    const name = unique();
    page.create({ name, type: "number", required: true });
    attributesLocators
      .rowByName(name)
      .find("[data-test='attr-row-required']")
      .should("have.text", "yes");
    page.deleteByName(name);
  });

  it("SW-ATTR-TC10: an attribute can be renamed @smoke", () => {
    const name = unique();
    // deliberately not a superstring of `name`, so "old name is gone" is a
    // meaningful assertion rather than one that can never hold
    const renamed = `Cy Renamed ${Date.now()}`;
    page.create({ name, type: "text" });
    page.editByName(name);
    attributesLocators.submit().should("contain", "Save changes");
    page.fill({ name: renamed }).submit();
    page.verifyHasAttribute(renamed);
    page.verifyNoAttribute(name);
    page.deleteByName(renamed);
  });

  it("SW-ATTR-TC11: cancelling an edit restores the create form", () => {
    page.editByName("Colour");
    attributesLocators.submit().should("contain", "Save changes");
    attributesLocators.cancel().click();
    attributesLocators.submit().should("contain", "Add attribute");
    attributesLocators.name().should("have.value", "");
  });
});
