/**
 * Inventory — Add to Cart Tests (SW-INV-CART-TC01..TC03)
 * =============================================================================
 * Cart-badge state transitions driven from the inventory grid.
 */
import InventoryPage from "../../pageObjects/InventoryPage";

describe("Inventory — Add to Cart", () => {
  const inventory = new InventoryPage();

  beforeEach(() => {
    cy.appSession();
    inventory.visit();
  });

  it("SW-INV-CART-TC01: adding a product shows a badge of 1 @smoke", () => {
    cy.get("[data-test='cart-badge']").should("not.be.visible");
    inventory.addFirstProductToCart();
    inventory.verifyCartBadge(1);
  });

  it("SW-INV-CART-TC02: adding two distinct products shows a badge of 2", () => {
    inventory.addProductByName("Pallet Jack 2.5T");
    inventory.addProductByName("Label Printer ZX-200");
    inventory.verifyCartBadge(2);
  });

  it("SW-INV-CART-TC03: an added product's button becomes disabled", () => {
    inventory.addFirstProductToCart();
    cy.get("[data-test='add-to-cart']").first().should("be.disabled");
  });
});
