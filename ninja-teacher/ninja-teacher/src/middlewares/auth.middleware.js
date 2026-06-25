const jwt = require("jsonwebtoken");
const Teacher = require("../modules/users/users.model");
const Admin   = require("../modules/admin/admin.model");

// ── DEBUG helper ───────────────────────────────────────────────────────────
const DEBUG = process.env.AUTH_DEBUG === "true";
function dbg(...args) {
  if (DEBUG) console.log("[AUTH_DEBUG]", ...args);
}

// ── protect ────────────────────────────────────────────────────────────────
async function protect(req, res, next) {
  const method  = req.method;
  const url     = req.originalUrl;
  const authHeader = req.headers.authorization;

  dbg(`→ ${method} ${url}`);
  dbg(`  Authorization header: ${authHeader ? authHeader.substring(0, 40) + "..." : "MISSING"}`);

  // ① No header / not Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    dbg(`  ✗ REJECT: no Authorization header or not Bearer`);
    dbg(`  All headers: ${JSON.stringify(Object.keys(req.headers))}`);
    return res.status(401).json({
      message: "No token provided. Please login.",
      _debug: DEBUG ? { reason: "missing_or_malformed_header", headers_received: Object.keys(req.headers) } : undefined,
    });
  }

  const token = authHeader.split(" ")[1];
  dbg(`  Token (first 40 chars): ${token.substring(0, 40)}...`);

  // ② Decode without verifying — to log the payload even if verify fails
  let rawDecoded = null;
  try {
    rawDecoded = jwt.decode(token);
    dbg(`  Decoded payload (no verify): ${JSON.stringify(rawDecoded)}`);
  } catch (_) { dbg(`  Could not decode token at all`); }

  // ③ Verify signature + expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    dbg(`  ✓ jwt.verify OK — payload: ${JSON.stringify(decoded)}`);
  } catch (error) {
    dbg(`  ✗ jwt.verify FAILED: ${error.name}: ${error.message}`);
    dbg(`  JWT_SECRET length: ${process.env.JWT_SECRET?.length ?? "UNDEFINED"}`);
    dbg(`  Token exp from raw decode: ${rawDecoded?.exp} (now: ${Math.floor(Date.now()/1000)})`);
    if (rawDecoded?.exp) {
      const expiredSecs = Math.floor(Date.now()/1000) - rawDecoded.exp;
      dbg(`  Token ${expiredSecs > 0 ? "EXPIRED " + expiredSecs + "s ago" : "not yet expired"}`);
    }
    return res.status(401).json({
      message: "Invalid or expired token.",
      _debug: DEBUG ? {
        reason: error.name,
        detail: error.message,
        token_exp: rawDecoded?.exp,
        token_id: rawDecoded?.id,
        now: Math.floor(Date.now()/1000),
        expired_by_seconds: rawDecoded?.exp ? Math.floor(Date.now()/1000) - rawDecoded.exp : null,
      } : undefined,
    });
  }

  // ④ Admin token used on user route
  if (decoded.type === "admin") {
    dbg(`  ✗ REJECT: admin token on user route`);
    return res.status(403).json({ message: "Admin accounts cannot access user routes." });
  }

  // ⑤ DB lookup
  dbg(`  Looking up Teacher with PK = ${decoded.id}`);
  const user = await Teacher.findByPk(decoded.id, {
    attributes: { exclude: ["Password"] },
  });

  if (!user) {
    dbg(`  ✗ REJECT: Teacher.findByPk(${decoded.id}) returned null — user does not exist in DB`);
    // Extra diagnostics: check if the DB has ANY rows
    const count = await Teacher.count();
    dbg(`  Teacher table total rows: ${count}`);
    return res.status(401).json({
      message: "User no longer exists.",
      _debug: DEBUG ? {
        reason: "user_not_found_in_db",
        looked_up_id: decoded.id,
        teacher_table_total_rows: count,
        hint: "This usually means the DB was wiped after the token was issued (stale token). Login again.",
      } : undefined,
    });
  }

  dbg(`  ✓ User found: Teacher_ID=${user.Teacher_ID} Role=${user.Role} Email=${user.Email}`);

  req.user     = user;
  req.userRole = decoded.role || "teacher";
  next();
}

// ── protectAdmin ───────────────────────────────────────────────────────────
async function protectAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  dbg(`→ ADMIN ${req.method} ${req.originalUrl}`);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    dbg(`  ✗ REJECT: no Bearer header`);
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    dbg(`  Admin token payload: ${JSON.stringify(decoded)}`);

    if (decoded.type !== "admin") {
      dbg(`  ✗ REJECT: token type is "${decoded.type}", expected "admin"`);
      return res.status(403).json({ message: "Access denied. Admin token required." });
    }

    const admin = await Admin.findByPk(decoded.id, { attributes: { exclude: ["password"] } });
    if (!admin) {
      dbg(`  ✗ REJECT: Admin.findByPk(${decoded.id}) returned null`);
      return res.status(401).json({ message: "Admin no longer exists." });
    }
    if (!admin.is_active) {
      dbg(`  ✗ REJECT: admin is deactivated`);
      return res.status(403).json({ message: "Admin account is deactivated." });
    }

    dbg(`  ✓ Admin found: id=${admin.id} role=${admin.role}`);
    req.admin = admin;
    next();
  } catch (error) {
    dbg(`  ✗ Admin jwt.verify FAILED: ${error.name}: ${error.message}`);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// ── requireSuperAdmin ──────────────────────────────────────────────────────
function requireSuperAdmin(req, res, next) {
  if (!req.admin || req.admin.role !== "super_admin") {
    return res.status(403).json({ message: "This action requires super_admin privileges." });
  }
  next();
}

// ── adminOnly (legacy) ─────────────────────────────────────────────────────
function adminOnly(req, res, next) {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

module.exports = { protect, protectAdmin, requireSuperAdmin, adminOnly };
