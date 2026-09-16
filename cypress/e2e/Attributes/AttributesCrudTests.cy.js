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
  
  
  });
