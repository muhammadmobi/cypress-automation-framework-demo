/* ShopWise mock REST API (json-server).
 *
 * On top of json-server's automatic CRUD for the resources in db.json
 * (products, categories, orders, notifications) this server adds:
 *   1. POST /auth/login         → issues a bearer token for user/password
 *   2. POST /auth/refresh       → swaps a refresh token for a fresh access token
 *   3. GET  /health             → liveness probe (used by start-server-and-test)
 *   4. GET  /stats              → computed dashboard KPIs (public)
 *   5. GET  /reports/summary    → computed category report (public)
 *   6. PATCH /notifications/read-all → bulk mark-as-read (bearer-guarded)
 *   7. POST /chat                → canned assistant replies (stub, bearer-guarded)
 *   8. POST /work-orders/:id/close → closes a work order (bearer-guarded)
 *   9. A bearer-token guard on every write method (POST/PUT/PATCH/DELETE),
 *      so the API specs can assert 401-without-auth and authenticated CRUD.
 *
 * Deliberately tiny and dependency-light so the whole suite runs offline in CI
 * with no real backend and no real credentials.
 */
const path = require("path");
const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults({ logger: false });
const db = router.db; // lowdb instance, for computed endpoints

const PORT = process.env.PORT || 3001;
const DEMO_TOKEN = "shopwise-demo-access-token";
const REFRESH_TOKEN = "shopwise-demo-refresh-token";
const CREDENTIALS = { user: "password" };
const LOW_STOCK_THRESHOLD = 15;

// Canned assistant replies. The chatbot is a stub on purpose: the point of the
// module is the drawer UX and its loading / error / retry states, so specs pin
// the response with cy.intercept rather than relying on anything generative.
const CHAT_REPLIES = [
  { match: /low\s+(on\s+)?stock|restock|stock\s+level/i, reply: "3 products are below the low-stock threshold.", intent: "low-stock" },
  { match: /order|revenue/i,     reply: "You have 1 order totalling $129.98.",           intent: "orders" },
  { match: /help|what can you/i, reply: "Ask me about stock levels, orders or reports.", intent: "help" },
];

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ── Liveness ────────────────────────────────────────────────────────────────
server.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Auth ──────────────────────────────────────────────────────────────────
server.post("/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }
  if (CREDENTIALS[username] !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  return res.status(200).json({
    accessToken: DEMO_TOKEN,
    refreshToken: REFRESH_TOKEN,
    username,
    role: "admin",
  });
});

server.post("/auth/refresh", (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken !== REFRESH_TOKEN) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
  return res.status(200).json({ accessToken: DEMO_TOKEN });
});

// ── Computed reads (public) ─────────────────────────────────────────────────
server.get("/stats", (_req, res) => {
  const products = db.get("products").value();
  const orders = db.get("orders").value();
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD);
  res.json({
    products: products.length,
    lowStock: lowStock.length,
    orders: orders.length,
    revenue: Number(orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)),
  });
});

server.get("/reports/summary", (_req, res) => {
  const products = db.get("products").value();
  const categories = db.get("categories").value();
  const rows = categories.map((c) => {
    const items = products.filter((p) => p.categoryId === c.id);
    return {
      category: c.name,
      productCount: items.length,
      totalStock: items.reduce((s, p) => s + p.stock, 0),
      stockValue: Number(items.reduce((s, p) => s + p.price * p.stock, 0).toFixed(2)),
    };
  });
  res.json({ rows });
});

// ── Bearer-token guard for mutations ─────────────────────────────────────────
server.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const auth = req.headers.authorization || "";
    if (auth !== `Bearer ${DEMO_TOKEN}`) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
  next();
});

// Bulk mark-as-read — defined before the json-server router so "read-all" is
// not mistaken for a notification id. (Guarded by the middleware above.)
server.patch("/notifications/read-all", (_req, res) => {
  db.get("notifications")
    .forEach((n) => (n.read = true))
    .write();
  res.json({ updated: db.get("notifications").value().length });
});

// Chatbot stub. Always answers; unknown questions get a fallback so the drawer
// never renders an empty bubble.
server.post("/chat", (req, res) => {
  const message = (req.body && req.body.message) || "";
  if (!message.trim()) {
    return res.status(400).json({ message: "message is required" });
  }
  const hit = CHAT_REPLIES.find((c) => c.match.test(message));
  return res.json({
    reply: hit ? hit.reply : "I do not have an answer for that yet.",
    intent: hit ? hit.intent : "unknown",
    suggestions: ["What is low on stock?", "How many orders?", "Help"],
  });
});

// Close a work order. Rejects a second close so specs can assert the guard.
server.post("/work-orders/:id/close", (req, res) => {
  const id = Number(req.params.id);
  const wo = db.get("workOrders").find({ id }).value();
  if (!wo) return res.status(404).json({ message: "Work order not found" });
  if (wo.status === "closed") {
    return res.status(409).json({ message: "Work order is already closed" });
  }
  db.get("workOrders").find({ id }).assign({ status: "closed" }).write();
  return res.json(db.get("workOrders").find({ id }).value());
});

server.use(router);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`ShopWise mock API listening on http://localhost:${PORT}`);
});
