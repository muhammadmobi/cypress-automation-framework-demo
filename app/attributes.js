/* ShopWise — Attributes admin.
 *
 * CRUD over /attributes. Kept in its own module so the screen can be added and
 * reviewed independently of app.js. Mirrors the production framework's
 * Configuration module: a required flag, a type, and a value list that only
 * applies to list-type attributes.
 */
(function () {
  "use strict";

  var API = (typeof API_BASE !== "undefined" && API_BASE) || "http://localhost:3001";
  var TYPES = ["text", "number", "list"];

  function headers() {
    if (typeof authHeaders === "function") {
      var h = authHeaders();
      h["Content-Type"] = "application/json";
      return h;
    }
    return { "Content-Type": "application/json" };
  }

  function init() {
    var table = document.querySelector("[data-test='attr-table']");
    if (!table) return;
    if (typeof requireAuth === "function" && !requireAuth()) return;

    var form = document.querySelector("[data-test='attr-form']");
    var nameEl = document.querySelector("[data-test='attr-name']");
    var typeEl = document.querySelector("[data-test='attr-type']");
    var reqEl = document.querySelector("[data-test='attr-required']");
    var valuesEl = document.querySelector("[data-test='attr-values']");
    var errorEl = document.querySelector("[data-test='attr-error']");
    var submitEl = document.querySelector("[data-test='attr-submit']");
    var cancelEl = document.querySelector("[data-test='attr-cancel']");
    var editingId = null;

    typeEl.innerHTML = TYPES.map(function (t) {
      return "<option value='" + t + "'>" + t + "</option>";
    }).join("");

    function showError(msg) {
      errorEl.textContent = msg || "";
      errorEl.style.display = msg ? "block" : "none";
    }

    // The value list only means anything for a list attribute.
    function syncValuesVisibility() {
      var isList = typeEl.value === "list";
      valuesEl.closest("label").style.display = isList ? "" : "none";
      if (!isList) valuesEl.value = "";
    }

    function resetForm() {
      editingId = null;
      form.reset();
      typeEl.value = "text";
      syncValuesVisibility();
      showError("");
      submitEl.textContent = "Add attribute";
      cancelEl.style.display = "none";
    }

    function draw(rows) {
      if (!rows.length) {
        table.innerHTML = "<p class='muted' data-test='attr-empty'>No attributes yet</p>";
        return;
      }
      table.innerHTML =
        "<table><thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Values</th><th></th></tr></thead><tbody>" +
        rows
          .map(function (a) {
            return (
              "<tr data-test='attr-row' data-attr-id='" + a.id + "'>" +
              "<td data-test='attr-row-name'>" + a.name + "</td>" +
              "<td data-test='attr-row-type'>" + a.type + "</td>" +
              "<td data-test='attr-row-required'>" + (a.required ? "yes" : "no") + "</td>" +
              "<td data-test='attr-row-values'>" + (a.values || []).join(", ") + "</td>" +
              "<td>" +
              "<button class='btn' data-test='attr-edit' data-attr-id='" + a.id + "'>Edit</button> " +
              "<button class='btn danger' data-test='attr-delete' data-attr-id='" + a.id + "'>Delete</button>" +
              "</td></tr>"
            );
          })
          .join("") +
        "</tbody></table>";
    }

    function load() {
      table.setAttribute("data-loading", "true");
      return fetch(API + "/attributes")
        .then(function (r) {
          return r.json();
        })
        .then(function (rows) {
          table.removeAttribute("data-loading");
          draw(rows);
          return rows;
        })
        .catch(function () {
          table.removeAttribute("data-loading");
          table.innerHTML =
            "<p class='muted' data-test='attr-load-error'>Could not load attributes</p>";
        });
    }

    typeEl.addEventListener("change", syncValuesVisibility);

    cancelEl.addEventListener("click", function (e) {
      e.preventDefault();
      resetForm();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = nameEl.value.trim();
      if (!name) return showError("Name is required");
      if (typeEl.value === "list" && !valuesEl.value.trim()) {
        return showError("A list attribute needs at least one value");
      }
      showError("");

      var body = {
        name: name,
        type: typeEl.value,
        required: reqEl.checked,
        values: valuesEl.value
          .split(",")
          .map(function (v) {
            return v.trim();
          })
          .filter(Boolean),
      };

      fetch(API + "/attributes" + (editingId ? "/" + editingId : ""), {
        method: editingId ? "PATCH" : "POST",
        headers: headers(),
        body: JSON.stringify(body),
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          resetForm();
          return load();
        })
        .catch(function () {
          showError("Could not save the attribute");
        });
    });

    table.addEventListener("click", function (e) {
      var edit = e.target.closest("[data-test='attr-edit']");
      var del = e.target.closest("[data-test='attr-delete']");

      if (edit) {
        var row = edit.closest("[data-test='attr-row']");
        editingId = Number(edit.dataset.attrId);
        nameEl.value = row.querySelector("[data-test='attr-row-name']").textContent;
        typeEl.value = row.querySelector("[data-test='attr-row-type']").textContent;
        reqEl.checked = row.querySelector("[data-test='attr-row-required']").textContent === "yes";
        valuesEl.value = row.querySelector("[data-test='attr-row-values']").textContent;
        syncValuesVisibility();
        submitEl.textContent = "Save changes";
        cancelEl.style.display = "";
        nameEl.focus();
      }

      if (del) {
        var id = Number(del.dataset.attrId);
        fetch(API + "/attributes/" + id, { method: "DELETE", headers: headers() })
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            if (editingId === id) resetForm();
            return load();
          })
          .catch(function () {
            showError("Could not delete the attribute");
          });
      }
    });

    resetForm();
    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
