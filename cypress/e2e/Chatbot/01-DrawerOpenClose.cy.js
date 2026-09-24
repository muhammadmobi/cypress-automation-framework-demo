/**
 * Assistant — drawer open/close (SW-CHAT-TC01..TC04)
 * =============================================================================
 * The drawer is the part of the assistant worth testing: the replies come from
 * a stub, so every spec here pins POST /chat with cy.intercept and asserts the
 * UX around it rather than anything generative.
 */
import ChatbotDrawer from "../../pageObjects/ChatbotDrawer";
import chatbotLocators from "../../support/locators/chatbotLocators";

describe("Assistant — drawer open/close", () => {
  const drawer = new ChatbotDrawer();

  beforeEach(() => {
    cy.appSession();
    cy.visit("/inventory.html");
  });

  it("SW-CHAT-TC01: the drawer is closed until the button is used @smoke", () => {
    chatbotLocators.fab().should("be.visible");
    drawer.verifyClosed();
  });

  it("SW-CHAT-TC02: the floating button opens the drawer @smoke", () => {
    drawer.open().verifyOpen();
  });

  it("SW-CHAT-TC03: the close button hides the drawer again @regression", () => {
    drawer.open().verifyOpen().close().verifyClosed();
  });

  it("SW-CHAT-TC04: the drawer opens with the starter suggestions @regression", () => {
    drawer.open();
    chatbotLocators.suggestions().should("have.length", 3);
    chatbotLocators.messages().should("not.exist");
  });
});
