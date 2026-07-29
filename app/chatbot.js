/* ShopWise assistant — floating button + drawer.
 *
 * Self-mounting: include this script on any authenticated page and it attaches
 * itself to <body>. Kept out of app.js so the module can be added, tested and
 * reviewed on its own.
 *
 * The replies come from POST /chat, which is a stub. What is worth testing here
 * is the drawer: open/close, the send button's enabled states, the loading
 * indicator, error + retry, and conversation reset.
 */
(function () {
  "use strict";

  var API = (typeof API_BASE !== "undefined" && API_BASE) || "http://localhost:3001";
  var SUGGESTIONS = ["What is low on stock?", "How many orders?", "Help"];

  // app.js already exposes authHeaders(); fall back to reading the session
  // directly so this module still works if it is loaded on its own.
  function headers() {
    if (typeof authHeaders === "function") {
      var h = authHeaders();
      h["Content-Type"] = "application/json";
      return h;
    }
    var tok = "";
    try {
      tok = (JSON.parse(localStorage.getItem("shopwise.session") || "{}") || {}).token || "";
    } catch (e) {
      tok = "";
    }
    return tok
      ? { Authorization: "Bearer " + tok, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  }

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }

  function mount() {
    if (document.querySelector("[data-test='chat-fab']")) return;
    if (!document.querySelector("[data-test='app-header']")) return; // login page

    var fab = el(
      "<button class='chat-fab' data-test='chat-fab' aria-label='Open assistant'>💬</button>"
    );
    var drawer = el(
      "<aside class='chat-drawer' data-test='chat-drawer' hidden>" +
        "<header class='chat-head'>" +
        "<strong>Assistant</strong>" +
        "<button class='chat-reset' data-test='chat-reset' title='Start over'>Reset</button>" +
        "<button class='chat-close' data-test='chat-close' aria-label='Close assistant'>×</button>" +
        "</header>" +
        "<div class='chat-log' data-test='chat-log'></div>" +
        "<div class='chat-suggestions' data-test='chat-suggestions'></div>" +
        "<form class='chat-form' data-test='chat-form'>" +
        "<input data-test='chat-input' placeholder='Ask about stock, orders or reports' autocomplete='off' />" +
        "<button class='btn' data-test='chat-send' disabled>Send</button>" +
        "</form>" +
        "</aside>"
    );

    document.body.appendChild(fab);
    document.body.appendChild(drawer);

    var log = drawer.querySelector("[data-test='chat-log']");
    var input = drawer.querySelector("[data-test='chat-input']");
    var send = drawer.querySelector("[data-test='chat-send']");
    var form = drawer.querySelector("[data-test='chat-form']");
    var sugHost = drawer.querySelector("[data-test='chat-suggestions']");
    var lastMessage = null;

    function drawSuggestions(list) {
      sugHost.innerHTML = (list || SUGGESTIONS)
        .map(function (s) {
          return "<button type='button' class='chip' data-test='chat-suggestion'>" + s + "</button>";
        })
        .join("");
    }

    function bubble(role, text, extra) {
      var node = el(
        "<div class='chat-msg " + role + "' data-test='chat-message' data-role='" + role + "'></div>"
      );
      node.textContent = text;
      if (extra) node.appendChild(extra);
      log.appendChild(node);
      log.scrollTop = log.scrollHeight;
      return node;
    }

    function setBusy(on) {
      send.disabled = on || !input.value.trim();
      input.disabled = on;
      var existing = drawer.querySelector("[data-test='chat-loading']");
      if (on && !existing) {
        log.appendChild(
          el("<div class='chat-msg bot loading' data-test='chat-loading'>Thinking…</div>")
        );
        log.scrollTop = log.scrollHeight;
      } else if (!on && existing) {
        existing.remove();
      }
    }

    function ask(message) {
      lastMessage = message;
      bubble("user", message);
      input.value = "";
      setBusy(true);
      fetch(API + "/chat", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ message: message }),
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(function (data) {
          setBusy(false);
          bubble("bot", data.reply);
          drawSuggestions(data.suggestions);
        })
        .catch(function () {
          setBusy(false);
          var retry = el("<button class='btn' data-test='chat-retry'>Retry</button>");
          retry.addEventListener("click", function () {
            var node = retry.closest("[data-test='chat-error']");
            if (node) node.remove();
            ask(lastMessage);
          });
          var err = el(
            "<div class='chat-msg error' data-test='chat-error'>Could not reach the assistant. </div>"
          );
          err.appendChild(retry);
          log.appendChild(err);
          log.scrollTop = log.scrollHeight;
        });
    }

    fab.addEventListener("click", function () {
      drawer.hidden = false;
      input.focus();
    });
    drawer.querySelector("[data-test='chat-close']").addEventListener("click", function () {
      drawer.hidden = true;
    });
    drawer.querySelector("[data-test='chat-reset']").addEventListener("click", function () {
      log.innerHTML = "";
      input.value = "";
      send.disabled = true;
      drawSuggestions();
    });
    input.addEventListener("input", function () {
      send.disabled = !input.value.trim();
    });
    sugHost.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-test='chat-suggestion']");
      if (chip) ask(chip.textContent);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (text) ask(text);
    });

    drawSuggestions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
