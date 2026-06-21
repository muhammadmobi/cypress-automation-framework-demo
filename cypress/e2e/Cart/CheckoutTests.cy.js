/**
 * Checkout Tests (SW-CHK-TC01..TC04)
 * =============================================================================
 * The full purchase flow plus checkout-form validation (decision table).
 *
 * The order-creation POST /orders is stubbed with cy.intercept so the test is
 * deterministic and does NOT mutate the mock API's seed data (the dedicated
 * write path is covered for real in api/OrdersAPI.cy.js).
 */
import InventoryPage from "../../pageObjects/InventoryPage";
import CheckoutPage from "../../pageObjects/CheckoutPage";

describe("Checkout", () => {
  const inventory = new InventoryPage();
  const checkout = new CheckoutPage();
  const buyer = { firstName: "Ada", lastName: "Lovelace", postalCode: "10115" };

  beforeEach(() => {
    cy.appSession();
    cy.intercept("POST", "**/orders", {
      statusCode: 201,
      body: { id: 999, reference: "SO-STUB", status: "fulfilled" },
    }).as("createOrder");
    inventory.visit();
  });

  it("SW-CHK-TC01: completes checkout with valid details @smoke", () => {
    inventory.addProductByName("Pallet Jack 2.5T").goToCart();
    checkout.proceedToCheckout().fillDetails(buyer).finish();
    checkout.verifyOrderComplete();
  });

  it("SW-CHK-TC02: a completed checkout posts an order to the API", () => {
    inventory.addFirstProductToCart().goToCart();
    checkout.proceedToCheckout().fillDetails(buyer).finish();
    cy.wait("@createOrder").its("request.headers.authorization").should("contain", "Bearer");
  });

  it("SW-CHK-TC03: checkout clears the cart after a successful order", () => {
    inventory.addFirstProductToCart().goToCart();
    checkout.proceedToCheckout().fillDetails(buyer).finish();
    checkout.verifyOrderComplete();
    checkout.visitCart();
    cy.get("[data-test='empty-cart']").should("be.visible");
  });

  // Validation decision table — each missing field surfaces its own error.
  const validationCases = [
    {
      field: "first name",
      details: { lastName: "Lovelace", postalCode: "10115" },
      error: "First Name is required",
    },
    {
      field: "last name",
      details: { firstName: "Ada", postalCode: "10115" },
      error: "Last Name is required",
    },
    {
      field: "postal code",
      details: { firstName: "Ada", lastName: "Lovelace" },
      error: "Postal Code is required",
    },
  ];

  validationCases.forEach(({ field, details, error }) => {
    it(`SW-CHK-TC04: checkout blocks a missing ${field} @regression`, () => {
      inventory.addFirstProductToCart().goToCart();
      checkout.proceedToCheckout().fillDetails(details).finish();
      checkout.verifyCheckoutError(error);
    });
  });
});
