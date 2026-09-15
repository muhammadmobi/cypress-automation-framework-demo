/**
 * Attributes — form validation (SW-ATTR-TC01..TC05)
 * =============================================================================
 * These rules are enforced client-side, so the list is stubbed and nothing is
 * ever written to the mock API.
 */
import AttributesPage from "../../pageObjects/AttributesPage";
import attributesLocators from "../../support/locators/attributesLocators";

describe("Attributes — validation", () => {
  const page = new AttributesPage();

  beforeEach(() => {
    cy.appSession();
    cy.intercept("GET", "**/attributes", {
      statusCode: 200,
      body: [{ id: 1, name: "Colour", type: "list", required: false, values: ["Black"] }],
    }).as("attrs");
    page.visit();
    cy.wait("@attrs");
  });

  it("SW-ATTR-TC01: an empty name is rejected @smoke", () => {
    page.fill({ name: "" }).submit();
    page.verifyError("Name is required");
  });

  it("SW-ATTR-TC02: a whitespace-only name is rejected @regression", () => {
    page.fill({ name: "   " }).submit();
    page.verifyError("Name is required");
  });

  it("SW-ATTR-TC03: a list attribute needs at least one value @smoke", () => {
    page.fill({ name: "Finish", type: "list", values: "" }).submit();
    page.verifyError("at least one value");
  });

  it("SW-ATTR-TC04: the values field only applies to list attributes @regression", () => {
    attributesLocators.type().select("text");
    page.verifyValuesFieldHidden();
    attributesLocators.type().select("list");
    page.verifyValuesFieldVisible();
  });

  it("SW-ATTR-TC05: a rejected submit never reaches the API", () => {
    cy.intercept("POST", "**/attributes", cy.spy().as("createCall"));
    page.fill({ name: "" }).submit();
    page.verifyError("Name is required");
    cy.get("@createCall").should("not.have.been.called");
  });
});
