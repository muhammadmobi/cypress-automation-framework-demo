/**
 * Cart Tests (SW-CART-TC01..TC04)
 * =============================================================================
 * Cart contents, removal, empty state, and the running total.
 */
import InventoryPage from "../../pageObjects/InventoryPage";
import CheckoutPage from "../../pageObjects/CheckoutPage";

describe("Cart", () => {
  const inventory = new InventoryPage();
  const checkout = new CheckoutPage();

  beforeEach(() => {
    cy.appSession();
    inventory.visit();
  });

  it("SW-CART-TC01: a product added on inventory appears in the cart @smoke", () => {
    inventory.addProductByName("Barcode Scanner Pro").goToCart();
    checkout.cartItemCount().should("eq", 1);
    cy.get("[data-test='cart-item-name']").should("contain", "Barcode Scanner Pro");
  });

  it("SW-CART-TC02: the cart shows a running total", () => {
    inventory.addProductByName("Pallet Jack 2.5T").goToCart();
    cy.get("[data-test='cart-total']").should("contain", "349.50");
  });

  it("SW-CART-TC03: removing the only item empties the cart", () => {
    inventory.addFirstProductToCart().goToCart();
    checkout.removeFirstItem();
    cy.get("[data-test='empty-cart']").should("be.visible");
  });

  it("SW-CART-TC04: an untouched cart starts empty @regression", () => {
    checkout.visitCart();
    cy.get("[data-test='empty-cart']").should("be.visible");
  });
});
