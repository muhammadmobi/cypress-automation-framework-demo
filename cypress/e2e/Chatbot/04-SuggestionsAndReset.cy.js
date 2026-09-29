/**
 * Assistant — suggestions and conversation reset (SW-CHAT-TC13..TC16)
 */
import ChatbotDrawer from "../../pageObjects/ChatbotDrawer";
import chatbotLocators from "../../support/locators/chatbotLocators";

describe("Assistant — suggestions and reset", () => {
  const drawer = new ChatbotDrawer();

  const stub = () =>
    cy
      .intercept("POST", "**/chat", {
        statusCode: 200,
        body: { reply: "Stubbed reply", intent: "help", suggestions: ["Help"] },
      })
      .as("chat");

  beforeEach(() => {
    cy.appSession();
    cy.visit("/inventory.html");
  });

  it("SW-CHAT-TC13: a suggestion chip sends its own text @smoke", () => {
    stub();
    drawer.open().clickSuggestion("Help");
    cy.wait("@chat").its("request.body.message").should("eq", "Help");
    chatbotLocators.messages().first().should("contain", "Help");
  });

  it("SW-CHAT-TC14: reset clears the conversation @regression", () => {
    stub();
    drawer.open().ask("Help");
    cy.wait("@chat");
    drawer.verifyMessageCount(2);
    drawer.reset();
    chatbotLocators.messages().should("not.exist");
  });

  it("SW-CHAT-TC15: reset also empties the input and disables send", () => {
    drawer.open();
    chatbotLocators.input().type("half typed");
    drawer.verifySendEnabled();
    drawer.reset();
    chatbotLocators.input().should("have.value", "");
    drawer.verifySendDisabled();
  });

  it("SW-CHAT-TC16: reset restores the starter suggestions @regression", () => {
    stub();
    drawer.open().ask("Help");
    cy.wait("@chat");
    chatbotLocators.suggestions().should("have.length", 1);
    drawer.reset();
    chatbotLocators.suggestions().should("have.length", 3);
  });
});
