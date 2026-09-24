/**
 * Assistant — send flow (SW-CHAT-TC05..TC08)
 * =============================================================================
 * Stub-driven: POST /chat is intercepted so the reply text is fixed and no
 * server state is touched.
 */
import ChatbotDrawer from "../../pageObjects/ChatbotDrawer";
import chatbotLocators from "../../support/locators/chatbotLocators";

describe("Assistant — send flow", () => {
  const drawer = new ChatbotDrawer();

  const stubReply = (reply, suggestions = ["Help"]) =>
    cy
      .intercept("POST", "**/chat", {
        statusCode: 200,
        body: { reply, intent: "low-stock", suggestions },
      })
      .as("chat");

  beforeEach(() => {
    cy.appSession();
    cy.visit("/inventory.html");
  });

  it("SW-CHAT-TC05: send is disabled until something is typed @smoke", () => {
    drawer.open().verifySendDisabled();
    chatbotLocators.input().type("hello");
    drawer.verifySendEnabled();
  });

  it("SW-CHAT-TC06: clearing the box disables send again @regression", () => {
    drawer.open();
    chatbotLocators.input().type("hello");
    drawer.verifySendEnabled();
    chatbotLocators.input().clear();
    drawer.verifySendDisabled();
  });

  it("SW-CHAT-TC07: sending shows the question and the reply @smoke", () => {
    stubReply("3 products are below the low-stock threshold.");
    drawer.open().ask("What is low on stock?");
    cy.wait("@chat");
    drawer.verifyMessageCount(2).verifyLastReply("3 products are below");
    chatbotLocators.messages().first().should("have.attr", "data-role", "user");
  });

  it("SW-CHAT-TC08: the reply refreshes the suggestion chips @regression", () => {
    stubReply("Anything else?", ["Show orders", "Show reports"]);
    drawer.open().ask("What is low on stock?");
    cy.wait("@chat");
    chatbotLocators.suggestions().should("have.length", 2);
    chatbotLocators.suggestions().first().should("contain", "Show orders");
  });
});
