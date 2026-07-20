/* ShopWise — Work Orders.
 *
 * List with a status filter and search, plus a close action that goes through
 * POST /work-orders/:id/close. Closing an already-closed order returns 409, and
 * the screen surfaces that rather than silently succeeding.
 */
(function () {
  "use strict";

  var API = (typeof API_BASE !== "undefined" && API_BASE) || "http://localhost:3001";

  function headers() {
    if (typeof authHeaders === "function") {
      var h = authHeaders();
      h["Content-Type"] = "application/json";
      return h;
    }
    return { "Content-Type": "application/json" };
  }

  function init() {
    var list = document.querySelector("[data-test='wo-list']");
    if (!list) return;
    if (typeof requireAuth === "function" && !requireAuth()) return;

    var statusEl = document.querySelector("[data-test='wo-status']");
    var searchEl = document.querySelector("[data-test='wo-search']");
    var countEl = document.querySelector("[data-test='wo-count']");
    var noticeEl = document.querySelector("[data-test='wo-notice']");
    var all = [];

    function notice(msg, kind) {
      noticeEl.textContent = msg || "";
      noticeEl.className = "notice " + (kind || "");
      noticeEl.style.display = msg ? "block" : "none";
    }

    function visible() {
      var status = statusEl.value;
      var q = searchEl.value.trim().toLowerCase();
      return all.filter(function (w) {
        var byStatus = status === "all" || w.status === status;
        var byText =
          !q ||
          w.title.toLowerCase().indexOf(q) !== -1 ||
          w.reference.toLowerCase().indexOf(q) !== -1;
        return byStatus && byText;
      });
    }

    function draw() {
      var rows = visible();
      countEl.textContent = rows.length + (rows.length === 1 ? " work order" : " work orders");
      if (!rows.length) {
        list.innerHTML = "<p class='muted' data-test='wo-empty'>No work orders match</p>";
        return;
      }
      list.innerHTML = rows
        .map(function (w) {
          return (
            "<div class='card' data-test='wo-row' data-wo-id='" + w.id + "' data-status='" + w.status + "'>" +
            "<h3 data-test='wo-title'>" + w.title + "</h3>" +
            "<p class='desc'><span data-test='wo-ref'>" + w.reference + "</span> · " +
            "<span data-test='wo-assignee'>" + w.assignee + "</span> · " +
            "<span data-test='wo-items'>" + w.items + " items</span></p>" +
            "<span class='pill' data-test='wo-status-pill'>" + w.status + "</span> " +
            (w.status === "closed"
              ? ""
              : "<button class='btn' data-test='wo-close' data-wo-id='" + w.id + "'>Close</button>") +
            "</div>"
          );
        })
        .join("");
    }

    function load() {
      list.setAttribute("data-loading", "true");
      return fetch(API + "/workOrders")
        .then(function (r) {
          return r.json();
        })
        .then(function (rows) {
          list.removeAttribute("data-loading");
          all = rows;
          draw();
        })
        .catch(function () {
          list.removeAttribute("data-loading");
          list.innerHTML = "<p class='muted' data-test='wo-load-error'>Could not load work orders</p>";
        });
    }

    statusEl.addEventListener("change", draw);
    searchEl.addEventListener("input", draw);

    list.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-test='wo-close']");
      if (!btn) return;
      var id = Number(btn.dataset.woId);
      btn.disabled = true;
      notice("");
      fetch(API + "/work-orders/" + id + "/close", { method: "POST", headers: headers() })
        .then(function (r) {
          if (r.status === 409) {
            notice("That work order is already closed.", "warn");
            return null;
          }
          if (!r.ok) throw new Error("HTTP " + r.status);
          notice("Work order closed.", "ok");
          return r.json();
        })
        .then(function () {
          return load();
        })
        .catch(function () {
          btn.disabled = false;
          notice("Could not close the work order.", "error");
        });
    });

    notice("");
    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
