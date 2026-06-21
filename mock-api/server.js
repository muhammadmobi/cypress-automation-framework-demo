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
 *   7. A bearer-token guard on every write method (POST/PUT/PATCH/DELETE),
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

server.use(router);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`ShopWise mock API listening on http://localhost:${PORT}`);
});
