/**
 * Inventory — Listing Tests (SW-INV-TC01..TC03)
 * =============================================================================
 * Product listing and on-screen schema. Login cached via cy.appSession.
 */
import InventoryPage from "../../pageObjects/InventoryPage";

describe("Inventory — Listing", () => {
  const inventory = new InventoryPage();

  beforeEach(() => {
    cy.appSession();
    inventory.visit();
  });

  it("SW-INV-TC01: lists all six demo products @smoke", () => {
    inventory.productCount().should("eq", 6);
  });

  it("SW-INV-TC02: every product shows a name and a formatted price", () => {
    cy.get("[data-test='product']").each(($card) => {
      cy.wrap($card).find("[data-test='product-name']").should("not.be.empty");
      cy.wrap($card)
        .find("[data-test='product-price']")
        .invoke("text")
        .should("match", /^\$\d+\.\d{2}$/);
    });
  });

  it("SW-INV-TC03: shows the notifications bell and cart link in the header", () => {
    cy.get("[data-test='notif-bell']").should("be.visible");
    cy.get("[data-test='cart-link']").should("be.visible");
  });
});
