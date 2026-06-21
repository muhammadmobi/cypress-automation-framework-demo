/* ShopWise demo SPA — the automation target.
 *
 * Session + cart live in localStorage (deterministic UI flows). Data-backed
 * pages (Dashboard, Orders, Reports, Notifications bell) read from the mock API
 * at API_BASE. On login the app also fetches a real bearer token from the API
 * so authenticated writes (create order, mark notifications read) work. */

const API_BASE = "http://localhost:3001";

const USERS = {
  user: { password: "password", locked: false },
  locked_user: { password: "password", locked: true },
};

const PRODUCTS = [
  {
    id: 1,
    name: "Warehouse Shelving Unit",
    price: 129.99,
    desc: "Heavy-duty 5-tier steel shelving for stockrooms.",
  },
  {
    id: 2,
    name: "Barcode Scanner Pro",
    price: 89.0,
    desc: "2D wireless scanner with charging cradle.",
  },
  {
    id: 3,
    name: "Pallet Jack 2.5T",
    price: 349.5,
    desc: "Manual hydraulic pallet truck, 2500 kg capacity.",
  },
  {
    id: 4,
    name: "Stackable Storage Bin",
    price: 14.25,
    desc: "Ventilated polypropylene bin, pack of 4.",
  },
  { id: 5, name: "Label Printer ZX-200", price: 199.99, desc: "Thermal label printer, 203 dpi." },
  {
    id: 6,
    name: "Safety Gloves (12pk)",
    price: 22.75,
    desc: "Cut-resistant warehouse gloves, dozen pack.",
  },
];

const Session = {
  get() {
    return JSON.parse(localStorage.getItem("shopwise.session") || "null");
  },
  set(v) {
    localStorage.setItem("shopwise.session", JSON.stringify(v));
  },
  token() {
    return (Session.get() || {}).token || null;
  },
  clear() {
    localStorage.removeItem("shopwise.session");
    localStorage.removeItem("shopwise.cart");
  },
};

const Cart = {
  get() {
    return JSON.parse(localStorage.getItem("shopwise.cart") || "[]");
  },
  set(items) {
    localStorage.setItem("shopwise.cart", JSON.stringify(items));
  },
  add(id) {
    const items = Cart.get();
    if (!items.includes(id)) items.push(id);
    Cart.set(items);
  },
  remove(id) {
    Cart.set(Cart.get().filter((x) => x !== id));
  },
  total() {
    return Cart.get().reduce((s, id) => s + (PRODUCTS.find((p) => p.id === id)?.price || 0), 0);
  },
  count() {
    return Cart.get().length;
  },
};

const Settings = {
  get() {
    return JSON.parse(localStorage.getItem("shopwise.settings") || '{"defaultSort":"az"}');
  },
  set(v) {
    localStorage.setItem("shopwise.settings", JSON.stringify(v));
  },
};

function authHeaders() {
  const token = Session.token();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

function requireAuth() {
  if (!Session.get()) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

/* ---- Shared header: nav + notifications bell ---- */
async function renderHeader() {
  const host = document.querySelector("[data-test='app-header']");
  if (!host) return;
  host.innerHTML = `
    <span class="brand">ShopWise</span>
    <nav>
      <a class="cart-link" href="inventory.html" data-test="nav-inventory">Inventory</a>
      <a class="cart-link" href="dashboard.html" data-test="nav-dashboard">Dashboard</a>
      <a class="cart-link" href="orders.html" data-test="nav-orders">Orders</a>
      <a class="cart-link" href="reports.html" data-test="nav-reports">Reports</a>
      <a class="cart-link" href="settings.html" data-test="nav-settings">Settings</a>
      <button class="bell" data-test="notif-bell" aria-label="Notifications">
        🔔<span class="cart-badge" data-test="notif-badge" style="display:none">0</span>
      </button>
      <a class="cart-link" href="cart.html" data-test="cart-link">
        Cart<span class="cart-badge" data-test="cart-badge" style="display:none">0</span>
      </a>
      <a href="#" class="cart-link" data-test="logout">Logout</a>
    </nav>
    <div class="popover" data-test="notif-popover" style="display:none"></div>`;

  // cart badge
  const cartBadge = host.querySelector("[data-test='cart-badge']");
  const n = Cart.count();
  cartBadge.textContent = n;
  cartBadge.style.display = n > 0 ? "inline-flex" : "none";

  // logout
  host.querySelector("[data-test='logout']").addEventListener("click", (e) => {
    e.preventDefault();
    Session.clear();
    window.location.href = "index.html";
  });

  // notifications bell
  const bell = host.querySelector("[data-test='notif-bell']");
  const popover = host.querySelector("[data-test='notif-popover']");
  bell.addEventListener("click", () => {
    popover.style.display = popover.style.display === "none" ? "block" : "none";
  });
  await loadNotifications(host);
}

async function loadNotifications(host) {
  const badge = host.querySelector("[data-test='notif-badge']");
  const popover = host.querySelector("[data-test='notif-popover']");
  try {
    const res = await fetch(`${API_BASE}/notifications`);
    const items = await res.json();
    const unread = items.filter((i) => !i.read).length;
    badge.textContent = unread > 99 ? "99+" : unread;
    badge.style.display = unread > 0 ? "inline-flex" : "none";
    popover.innerHTML = items.length
      ? `<button class="btn" data-test="notif-mark-all" style="margin-bottom:10px">Mark all read</button>` +
        items
          .map(
            (i) =>
              `<div class="notif ${i.read ? "read" : "unread"}" data-test="notif-item" data-read="${i.read}">${i.title}</div>`
          )
          .join("")
      : `<p class="muted" data-test="notif-empty">No notifications</p>`;
    const markAll = popover.querySelector("[data-test='notif-mark-all']");
    if (markAll) {
      markAll.addEventListener("click", async () => {
        await fetch(`${API_BASE}/notifications/read-all`, {
          method: "PATCH",
          headers: authHeaders(),
        });
        await loadNotifications(host);
      });
    }
  } catch {
    badge.style.display = "none";
    popover.innerHTML = `<p class="muted" data-test="notif-error">Could not load notifications</p>`;
  }
}

/* ---- Login ---- */
function initLogin() {
  const form = document.querySelector("[data-test='login-form']");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.querySelector("[data-test='username']").value.trim();
    const password = document.querySelector("[data-test='password']").value;
    const err = document.querySelector("[data-test='login-error']");
    err.textContent = "";

    if (!username) return (err.textContent = "Username is required");
    if (!password) return (err.textContent = "Password is required");

    const record = USERS[username];
    if (!record || record.password !== password) {
      return (err.textContent = "Invalid credentials: username or password is incorrect");
    }
    if (record.locked) {
      return (err.textContent = "Sorry, this user has been locked out.");
    }

    // Best-effort: obtain a real bearer token so guarded writes work.
    let token = null;
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) token = (await res.json()).accessToken;
    } catch {
      /* API offline — UI flows that don't need a token still work */
    }
    Session.set({ username, role: username === "user" ? "admin" : "worker", token });
    window.location.href = "inventory.html";
  });
}

/* ---- Inventory ---- */
function initInventory() {
  const grid = document.querySelector("[data-test='inventory-grid']");
  if (!grid) return;
  if (!requireAuth()) return;

  const sort = document.querySelector("[data-test='sort']");
  if (sort) sort.value = Settings.get().defaultSort || "az";

  function draw() {
    const order = sort ? sort.value : "az";
    const list = [...PRODUCTS].sort((a, b) => {
      if (order === "az") return a.name.localeCompare(b.name);
      if (order === "za") return b.name.localeCompare(a.name);
      if (order === "lohi") return a.price - b.price;
      if (order === "hilo") return b.price - a.price;
      return 0;
    });
    grid.innerHTML = list
      .map(
        (p) => `
      <div class="card" data-test="product" data-product-id="${p.id}">
        <h3 data-test="product-name">${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="price" data-test="product-price">$${p.price.toFixed(2)}</div>
        <button class="btn" data-test="add-to-cart" data-product-id="${p.id}">Add to cart</button>
      </div>`
      )
      .join("");
    grid.querySelectorAll("[data-test='add-to-cart']").forEach((btn) => {
      btn.addEventListener("click", () => {
        Cart.add(Number(btn.dataset.productId));
        btn.textContent = "Added ✓";
        btn.disabled = true;
        renderHeader();
      });
    });
  }
  if (sort) sort.addEventListener("change", draw);
  draw();
}

/* ---- Cart ---- */
function initCart() {
  const list = document.querySelector("[data-test='cart-list']");
  if (!list) return;
  if (!requireAuth()) return;

  function draw() {
    const ids = Cart.get();
    if (ids.length === 0) {
      list.innerHTML = `<p class="muted" data-test="empty-cart">Your cart is empty.</p>`;
    } else {
      list.innerHTML =
        ids
          .map((id) => {
            const p = PRODUCTS.find((x) => x.id === id);
            return `<div class="row" data-test="cart-item" data-product-id="${id}">
            <div><strong data-test="cart-item-name">${p.name}</strong><br><span class="muted">$${p.price.toFixed(2)}</span></div>
            <button class="btn danger" style="width:auto" data-test="remove-from-cart" data-product-id="${id}">Remove</button>
          </div>`;
          })
          .join("") +
        `<p data-test="cart-total" style="text-align:right;font-weight:700">Total: $${Cart.total().toFixed(2)}</p>`;
      list.querySelectorAll("[data-test='remove-from-cart']").forEach((btn) => {
        btn.addEventListener("click", () => {
          Cart.remove(Number(btn.dataset.productId));
          draw();
          renderHeader();
        });
      });
    }
  }
  draw();
}

/* ---- Checkout ---- */
function initCheckout() {
  const form = document.querySelector("[data-test='checkout-form']");
  if (!form) return;
  if (!requireAuth()) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const first = document.querySelector("[data-test='first-name']").value.trim();
    const last = document.querySelector("[data-test='last-name']").value.trim();
    const zip = document.querySelector("[data-test='postal-code']").value.trim();
    const err = document.querySelector("[data-test='checkout-error']");
    err.textContent = "";

    if (!first) return (err.textContent = "First Name is required");
    if (!last) return (err.textContent = "Last Name is required");
    if (!zip) return (err.textContent = "Postal Code is required");
    if (Cart.count() === 0) return (err.textContent = "Cannot checkout an empty cart");

    // Best-effort order creation against the mock API.
    try {
      await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          reference: `SO-${Date.now()}`,
          customer: `${first} ${last}`,
          total: Number(Cart.total().toFixed(2)),
          status: "fulfilled",
        }),
      });
    } catch {
      /* ignore — UI flow still completes */
    }
    Cart.set([]);
    window.location.href = "confirmation.html";
  });
}

/* ---- Dashboard ---- */
async function initDashboard() {
  const root = document.querySelector("[data-test='dashboard']");
  if (!root) return;
  if (!requireAuth()) return;
  try {
    const stats = await (await fetch(`${API_BASE}/stats`)).json();
    document.querySelector("[data-test='stat-products']").textContent = stats.products;
    document.querySelector("[data-test='stat-lowstock']").textContent = stats.lowStock;
    document.querySelector("[data-test='stat-orders']").textContent = stats.orders;
    document.querySelector("[data-test='stat-revenue']").textContent =
      `$${stats.revenue.toFixed(2)}`;
    root.querySelector("[data-test='dashboard-error']").textContent = "";
  } catch {
    root.querySelector("[data-test='dashboard-error']").textContent = "Failed to load stats";
  }
}

/* ---- Orders ---- */
async function initOrders() {
  const body = document.querySelector("[data-test='orders-body']");
  if (!body) return;
  if (!requireAuth()) return;
  try {
    const orders = await (await fetch(`${API_BASE}/orders`)).json();
    body.innerHTML = orders.length
      ? orders
          .map(
            (o) =>
              `<tr data-test="order-row"><td data-test="order-ref">${o.reference}</td><td>${o.customer}</td><td>$${Number(o.total).toFixed(2)}</td><td data-test="order-status">${o.status}</td></tr>`
          )
          .join("")
      : `<tr><td colspan="4" data-test="orders-empty" class="muted">No orders yet</td></tr>`;
  } catch {
    body.innerHTML = `<tr><td colspan="4" data-test="orders-error" class="muted">Failed to load orders</td></tr>`;
  }
}

/* ---- Reports ---- */
async function initReports() {
  const body = document.querySelector("[data-test='reports-body']");
  if (!body) return;
  if (!requireAuth()) return;
  try {
    const { rows } = await (await fetch(`${API_BASE}/reports/summary`)).json();
    body.innerHTML = rows
      .map(
        (r) =>
          `<tr data-test="report-row"><td data-test="report-category">${r.category}</td><td>${r.productCount}</td><td>${r.totalStock}</td><td>$${r.stockValue.toFixed(2)}</td></tr>`
      )
      .join("");
  } catch {
    body.innerHTML = `<tr><td colspan="4" data-test="reports-error" class="muted">Failed to load report</td></tr>`;
  }
}

/* ---- Settings ---- */
function initSettings() {
  const form = document.querySelector("[data-test='settings-form']");
  if (!form) return;
  if (!requireAuth()) return;
  const select = document.querySelector("[data-test='setting-default-sort']");
  select.value = Settings.get().defaultSort || "az";
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    Settings.set({ defaultSort: select.value });
    document.querySelector("[data-test='settings-saved']").textContent = "Settings saved";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  // Authenticated pages render the shared header (nav + bell) first.
  if (document.querySelector("[data-test='app-header']")) {
    if (!requireAuth()) return;
    renderHeader();
  }
  initInventory();
  initCart();
  initCheckout();
  initDashboard();
  initOrders();
  initReports();
  initSettings();
});
