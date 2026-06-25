#!/usr/bin/env node
// deep_401_probe.mjs
// Probes every realistic 401 scenario with full request + response capture.
// Run with AUTH_DEBUG=true in the server environment to see middleware logs.

const BASE = "http://localhost:3000";

// ── helpers ────────────────────────────────────────────────────────────────
function decodeJwt(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const pad = parts[1].length % 4;
    const b64 = parts[1] + (pad ? "=".repeat(4 - pad) : "");
    return JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
  } catch { return null; }
}

async function req(method, path, { token, body, rawToken } = {}) {
  const headers = { "Content-Type": "application/json" };
  const authVal = rawToken !== undefined ? rawToken : (token ? `Bearer ${token}` : null);
  if (authVal) headers.Authorization = authVal;

  const res = await fetch(BASE + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data, sentHeaders: headers };
}

let pass = 0, fail = 0;
const REPORT = [];

function record(scenario, checks, requestInfo, responseInfo, analysis) {
  const allPassed = checks.every(c => c.ok);
  REPORT.push({ scenario, checks, requestInfo, responseInfo, analysis, allPassed });
  checks.forEach(c => { if (c.ok) pass++; else fail++; });
}

// ── job payload ────────────────────────────────────────────────────────────
const JOB_BODY = {
  jobDetails: {
    positionTitle: "Math Teacher",
    location: "Cairo, Nasr City",
    subjects: ["Mathematics"],
    salaryRange: "$40k-$60k",
    requiredExperience: "3-5 years",
    qualifications: "BA Education",
  },
  personality: {
    teachingStyle: ["structured"],
    classroomEnergy: ["balanced"],
    leadershipStyle: ["mentor"],
    communicationStyle: ["empathetic"],
    problemSolving: ["analytical"],
  },
  submittedAt: new Date().toISOString(),
};

// ══════════════════════════════════════════════════════════════════════════
(async () => {
  const stamp = Date.now();
  const schoolEmail = `school_${stamp}@probe.com`;
  const PASS = "secret123";

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║         DEEP 401 PROBE — REQUEST + RESPONSE CAPTURE         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`Started: ${new Date().toISOString()}\n`);

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 0: Register + Login to get valid token
  // ══════════════════════════════════════════════════════════════════════
  console.log("══ SETUP: register + login ══");
  const regRes = await req("POST", "/auth/register", {
    body: { name: "Probe School", email: schoolEmail, password: PASS,
            confirm_password: PASS, role: "school", school_type: "Private" },
  });
  const VALID_TOKEN = regRes.data?.data?.token;
  const USER_ID     = regRes.data?.data?.user?.id;
  const JWT_PAYLOAD = decodeJwt(VALID_TOKEN);
  console.log(`  register → ${regRes.status}`);
  console.log(`  user.id  = ${USER_ID}`);
  console.log(`  JWT payload: ${JSON.stringify(JWT_PAYLOAD)}`);
  console.log(`  token issued at: ${new Date(JWT_PAYLOAD?.iat * 1000).toISOString()}`);
  console.log(`  token expires:   ${new Date(JWT_PAYLOAD?.exp * 1000).toISOString()}`);

  if (regRes.status !== 201 || !VALID_TOKEN) {
    console.error("\n[FATAL] Registration failed — cannot proceed\n", regRes.data);
    process.exit(2);
  }

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 1: Valid fresh token → POST /job-posts
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 1: Valid fresh token → POST /job-posts");
  console.log("────────────────────────────────────────────────────────────────");
  const s1 = await req("POST", "/job-posts", { token: VALID_TOKEN, body: JOB_BODY });
  console.log(`  REQUEST  Authorization: Bearer ${VALID_TOKEN.substring(0,40)}...`);
  console.log(`  RESPONSE status: ${s1.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s1.data).substring(0, 200)}`);
  record("Valid token → POST /job-posts", [
    { label: "status 201", ok: s1.status === 201 },
    { label: "not 401",    ok: s1.status !== 401 },
    { label: "not 403",    ok: s1.status !== 403 },
  ], { Authorization: `Bearer ${VALID_TOKEN.substring(0,40)}...`, jwtPayload: JWT_PAYLOAD },
     { status: s1.status, body: s1.data },
     s1.status === 201 ? "✓ Working correctly" : `✗ Unexpected ${s1.status}`);
  const JOB_ID = s1.data?.data?.job_id;

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 2: Valid token → GET /school/dashboard
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 2: Valid token → GET /school/dashboard");
  console.log("────────────────────────────────────────────────────────────────");
  const s2 = await req("GET", "/school/dashboard", { token: VALID_TOKEN });
  console.log(`  REQUEST  Authorization: Bearer ${VALID_TOKEN.substring(0,40)}...`);
  console.log(`  RESPONSE status: ${s2.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s2.data).substring(0, 200)}`);
  record("Valid token → GET /school/dashboard", [
    { label: "status 200", ok: s2.status === 200 },
    { label: "not 401",    ok: s2.status !== 401 },
  ], { Authorization: `Bearer ${VALID_TOKEN.substring(0,40)}...` },
     { status: s2.status, body: s2.data }, "");

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 3: Valid token → GET /job-posts/my
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 3: Valid token → GET /job-posts/my");
  console.log("────────────────────────────────────────────────────────────────");
  const s3 = await req("GET", "/job-posts/my", { token: VALID_TOKEN });
  console.log(`  RESPONSE status: ${s3.status}, jobs: ${s3.data?.data?.jobs?.length ?? "N/A"}`);
  record("Valid token → GET /job-posts/my", [
    { label: "status 200", ok: s3.status === 200 },
    { label: "not 401",    ok: s3.status !== 401 },
    { label: "contains created job", ok: (s3.data?.data?.jobs||[]).some(j => j.job_id === JOB_ID) },
  ], {}, { status: s3.status, jobs_count: s3.data?.data?.jobs?.length }, "");

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 4: Valid token → GET /users/me
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 4: Valid token → GET /users/me");
  console.log("────────────────────────────────────────────────────────────────");
  const s4 = await req("GET", "/users/me", { token: VALID_TOKEN });
  console.log(`  RESPONSE status: ${s4.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s4.data).substring(0, 200)}`);
  record("Valid token → GET /users/me", [
    { label: "status 200", ok: s4.status === 200 },
    { label: "not 401",    ok: s4.status !== 401 },
  ], {}, { status: s4.status, body: s4.data }, "");

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 5: Valid token → GET /profile
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 5: Valid token → GET /profile");
  console.log("────────────────────────────────────────────────────────────────");
  const s5 = await req("GET", "/profile", { token: VALID_TOKEN });
  console.log(`  RESPONSE status: ${s5.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s5.data).substring(0, 200)}`);
  record("Valid token → GET /profile", [
    { label: "status 200 or 404", ok: s5.status === 200 || s5.status === 404 },
    { label: "not 401", ok: s5.status !== 401 },
  ], {}, { status: s5.status }, "");

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 6: NO token header → POST /job-posts
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 6: No Authorization header → POST /job-posts");
  console.log("────────────────────────────────────────────────────────────────");
  const s6 = await req("POST", "/job-posts", { body: JOB_BODY });
  console.log(`  REQUEST  Authorization: (none)`);
  console.log(`  RESPONSE status: ${s6.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s6.data)}`);
  console.log(`  REJECTION POINT: protect() → "No token provided. Please login."`);
  record("No token header → POST /job-posts", [
    { label: "status 401", ok: s6.status === 401 },
    { label: "message is no-token", ok: s6.data?.message?.includes("No token") },
  ], { Authorization: "(none)" },
     { status: s6.status, body: s6.data },
     "Expected. Missing Authorization header → protect() line 1 guard fires.");

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 7: Malformed header — no "Bearer " prefix
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 7: Malformed header (no Bearer prefix) → POST /job-posts");
  console.log("────────────────────────────────────────────────────────────────");
  const s7 = await req("POST", "/job-posts", {
    body: JOB_BODY,
    rawToken: VALID_TOKEN, // token WITHOUT "Bearer " prefix
  });
  console.log(`  REQUEST  Authorization: ${VALID_TOKEN.substring(0,40)}... (no Bearer prefix)`);
  console.log(`  RESPONSE status: ${s7.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s7.data)}`);
  console.log(`  REJECTION POINT: protect() → "No token provided" (startsWith check fails)`);
  record('Malformed header — no "Bearer " prefix', [
    { label: "status 401", ok: s7.status === 401 },
    { label: "because missing Bearer prefix", ok: s7.data?.message?.includes("No token") },
  ], { Authorization: "(token without 'Bearer ' prefix)" },
     { status: s7.status, body: s7.data },
     '✗ THIS IS A REAL USER MISTAKE — frontend must send "Bearer <token>" not just "<token>"');

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 8: "bearer" (lowercase) prefix
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 8: lowercase 'bearer' prefix → POST /job-posts");
  console.log("────────────────────────────────────────────────────────────────");
  const s8 = await req("POST", "/job-posts", {
    body: JOB_BODY,
    rawToken: `bearer ${VALID_TOKEN}`, // lowercase
  });
  console.log(`  REQUEST  Authorization: bearer ${VALID_TOKEN.substring(0,20)}...`);
  console.log(`  RESPONSE status: ${s8.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s8.data)}`);
  console.log(`  REJECTION POINT: protect() startsWith("Bearer ") — case sensitive`);
  record('Lowercase "bearer" prefix → 401', [
    { label: "status 401", ok: s8.status === 401 },
  ], { Authorization: `bearer ${VALID_TOKEN.substring(0,20)}...` },
     { status: s8.status, body: s8.data },
     '✗ REAL CAUSE: middleware checks startsWith("Bearer ") — case sensitive. "bearer" fails.');

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 9: Expired token (constructed manually)
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 9: Expired token → POST /job-posts");
  console.log("────────────────────────────────────────────────────────────────");
  // Build a token that expired 1 second ago using the same secret
  const jwt = (await import("jsonwebtoken")).default;
  const EXPIRED_TOKEN = jwt.sign(
    { id: USER_ID, role: "school", type: "user" },
    process.env.JWT_SECRET || "dev_secret_change_me_0123456789abcdef",
    { expiresIn: "1ms" }
  );
  await new Promise(r => setTimeout(r, 50)); // ensure it's expired
  const expPayload = decodeJwt(EXPIRED_TOKEN);
  console.log(`  EXPIRED token payload: ${JSON.stringify(expPayload)}`);
  console.log(`  Now: ${Math.floor(Date.now()/1000)}, exp: ${expPayload?.exp}`);
  const s9 = await req("POST", "/job-posts", { token: EXPIRED_TOKEN, body: JOB_BODY });
  console.log(`  RESPONSE status: ${s9.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s9.data)}`);
  console.log(`  REJECTION POINT: jwt.verify throws TokenExpiredError → "Invalid or expired token."`);
  record("Expired token → 401", [
    { label: "status 401",         ok: s9.status === 401 },
    { label: "message mentions expired or invalid", ok: s9.data?.message?.toLowerCase().includes("expired") || s9.data?.message?.toLowerCase().includes("invalid") },
  ], { Authorization: `Bearer ${EXPIRED_TOKEN.substring(0,40)}...`, jwtPayload: expPayload },
     { status: s9.status, body: s9.data },
     "Expected. jwt.verify catches TokenExpiredError and returns 401.");

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 10: Stale token — valid signature, user deleted from DB
  // Simulate: create user, get token, delete user, use token
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 10: Stale token — user deleted after token issued");
  console.log("────────────────────────────────────────────────────────────────");
  const staleEmail = `stale_${stamp}@probe.com`;
  const staleReg = await req("POST", "/auth/register", {
    body: { name: "Stale School", email: staleEmail, password: PASS,
            confirm_password: PASS, role: "school" },
  });
  const STALE_TOKEN = staleReg.data?.data?.token;
  const STALE_ID    = staleReg.data?.data?.user?.id;
  console.log(`  Created user ID: ${STALE_ID}, token issued ✓`);

  // Delete the user via admin
  const adminLogin = await req("POST", "/admin/auth/login", {
    body: { email: "admin@ninjateacher.com", password: "ChangeMe@1234" },
  });
  const ADMIN_TOKEN = adminLogin.data?.data?.token;
  const delRes = await req("DELETE", `/admin/users/${STALE_ID}`, { token: ADMIN_TOKEN });
  console.log(`  Deleted user ${STALE_ID} via admin → ${delRes.status}`);

  const s10 = await req("POST", "/job-posts", { token: STALE_TOKEN, body: JOB_BODY });
  console.log(`  REQUEST  Using token for deleted user ${STALE_ID}`);
  console.log(`  RESPONSE status: ${s10.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s10.data)}`);
  const staleDbg = s10.data?._debug;
  if (staleDbg) {
    console.log(`  DEBUG reason:    ${staleDbg.reason}`);
    console.log(`  DB rows:         ${staleDbg.teacher_table_total_rows}`);
    console.log(`  hint:            ${staleDbg.hint}`);
  }
  console.log(`  REJECTION POINT: Teacher.findByPk(${STALE_ID}) → null → "User no longer exists."`);
  record("Stale token (user deleted) → 401", [
    { label: "status 401", ok: s10.status === 401 },
    { label: "message user-no-longer-exists", ok: s10.data?.message?.includes("no longer exists") },
  ], { Authorization: `Bearer ${STALE_TOKEN?.substring(0,40)}...`, userId: STALE_ID },
     { status: s10.status, body: s10.data },
     `✗ STALE TOKEN. Token is cryptographically valid (passes jwt.verify) but Teacher.findByPk(${STALE_ID}) returns null because the row is gone. This is the exact cause when users say "I was working fine, now I keep getting 401".`);

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 11: Wrong JWT_SECRET (token signed with different secret)
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 11: Token signed with wrong secret → POST /job-posts");
  console.log("────────────────────────────────────────────────────────────────");
  const WRONG_TOKEN = jwt.sign(
    { id: USER_ID, role: "school", type: "user" },
    "completely_wrong_secret_xyz",
    { expiresIn: "7d" }
  );
  const s11 = await req("POST", "/job-posts", { token: WRONG_TOKEN, body: JOB_BODY });
  console.log(`  REQUEST  Token signed with WRONG secret`);
  console.log(`  RESPONSE status: ${s11.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s11.data)}`);
  console.log(`  REJECTION POINT: jwt.verify throws JsonWebTokenError → "Invalid or expired token."`);
  record("Wrong-secret token → 401", [
    { label: "status 401", ok: s11.status === 401 },
  ], { Authorization: `Bearer <token_signed_with_wrong_secret>` },
     { status: s11.status, body: s11.data },
     "Expected. jwt.verify throws JsonWebTokenError for bad signature.");

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 12: Token with "Bearer " prefix doubled (common frontend bug)
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 12: Double 'Bearer Bearer' prefix → POST /job-posts");
  console.log("────────────────────────────────────────────────────────────────");
  const s12 = await req("POST", "/job-posts", {
    body: JOB_BODY,
    rawToken: `Bearer Bearer ${VALID_TOKEN}`,
  });
  console.log(`  REQUEST  Authorization: "Bearer Bearer <token>"`);
  console.log(`  RESPONSE status: ${s12.status}`);
  console.log(`  RESPONSE body:   ${JSON.stringify(s12.data)}`);
  record('Double "Bearer Bearer" → 401', [
    { label: "status 401",  ok: s12.status === 401 },
  ], { Authorization: `"Bearer Bearer <token>" (doubled)` },
     { status: s12.status, body: s12.data },
     '✗ REAL FRONTEND BUG: frontend stores token as "Bearer <token>" then sends "Bearer " + storedValue. jwt.verify receives "Bearer <token>" as the token string which is not a valid JWT.');

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 13: Token stored with "Bearer " prefix in localStorage
  //              Then sent as "Bearer Bearer <token>"
  //              Replicate exact frontend storage pattern
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 13: Simulate frontend that stores full 'Bearer <token>'");
  console.log("  and sends it directly as Authorization value");
  console.log("────────────────────────────────────────────────────────────────");
  // If frontend stores the full "Bearer eyJ..." string and sets it directly:
  const storedWithBearer = `Bearer ${VALID_TOKEN}`;
  const s13 = await req("POST", "/job-posts", {
    body: JOB_BODY,
    rawToken: storedWithBearer, // Already has "Bearer " — correct usage
  });
  console.log(`  Stored value: "Bearer eyJ..." (full header value)`);
  console.log(`  Sent as Authorization: ${storedWithBearer.substring(0,40)}...`);
  console.log(`  RESPONSE status: ${s13.status}`);
  record("Frontend stores 'Bearer <tok>' and sends directly → works", [
    { label: "status 201 (correct storage pattern)", ok: s13.status === 201 },
  ], { Authorization: `Bearer ${VALID_TOKEN.substring(0,20)}... (stored + sent correctly)` },
     { status: s13.status },
     s13.status === 201 ? "✓ This pattern works fine" : `✗ Got ${s13.status}`);

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 14: Fresh login → new token → immediate use
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 14: Fresh login + immediate use (stale-token fix proof)");
  console.log("────────────────────────────────────────────────────────────────");
  const freshLogin = await req("POST", "/auth/login", {
    body: { email: schoolEmail, password: PASS },
  });
  const FRESH_TOKEN   = freshLogin.data?.data?.token;
  const freshPayload  = decodeJwt(FRESH_TOKEN);
  console.log(`  Fresh login → ${freshLogin.status}`);
  console.log(`  New token payload: ${JSON.stringify(freshPayload)}`);
  const s14 = await req("POST", "/job-posts", { token: FRESH_TOKEN, body: JOB_BODY });
  console.log(`  Immediate POST /job-posts → ${s14.status}`);
  record("Fresh login token → immediate job create", [
    { label: "login 200",   ok: freshLogin.status === 200 },
    { label: "create 201",  ok: s14.status === 201 },
    { label: "not 401",     ok: s14.status !== 401 },
  ], { Authorization: `Bearer ${FRESH_TOKEN?.substring(0,40)}...`, jwtPayload: freshPayload },
     { status: s14.status, body: s14.data?.data ? { job_id: s14.data.data.job_id, title: s14.data.data.Title } : s14.data },
     "✓ Fresh token always works. If previous token gave 401, it was stale (user deleted, or DB wiped).");

  // ══════════════════════════════════════════════════════════════════════
  // SCENARIO 15: Verify ALL other protected endpoints with same token
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n────────────────────────────────────────────────────────────────");
  console.log("SCENARIO 15: Regression — all protected endpoints, valid token");
  console.log("────────────────────────────────────────────────────────────────");
  const endpoints = [
    { method: "GET",  path: "/school/dashboard" },
    { method: "GET",  path: "/school/jobs" },
    { method: "GET",  path: "/school/profile" },
    { method: "GET",  path: "/job-posts/my" },
    { method: "GET",  path: "/users/me" },
    { method: "GET",  path: "/notifications" },
    { method: "GET",  path: "/dashboard" },
    { method: "GET",  path: "/subscriptions" },
    { method: "GET",  path: "/applied-jobs" },
    { method: "GET",  path: "/profile" },
    { method: "GET",  path: "/messages" },
  ];
  const epChecks = [];
  for (const ep of endpoints) {
    const r = await req(ep.method, ep.path, { token: FRESH_TOKEN });
    const ok = r.status !== 401 && r.status !== 403;
    const mark = ok ? "✓" : "✗";
    console.log(`  ${mark} ${ep.method} ${ep.path} → ${r.status} ${!ok ? r.data?.message || "" : ""}`);
    epChecks.push({ label: `${ep.method} ${ep.path} not 401/403`, ok });
  }
  record("All protected endpoints — valid token", epChecks, {}, {}, "");

  // ══════════════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ══════════════════════════════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║                     FINAL REPORT                            ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  for (const r of REPORT) {
    const status = r.checks.every(c => c.ok) ? "✓ PASS" : "✗ FAIL";
    console.log(`\n${status}  ${r.scenario}`);
    for (const c of r.checks) {
      console.log(`       ${c.ok ? "✓" : "✗"}  ${c.label}`);
    }
    if (r.analysis) console.log(`       ↳  ${r.analysis}`);
  }

  console.log(`\n${"─".repeat(64)}`);
  console.log(`TOTAL: ${pass} passed, ${fail} failed`);
  console.log(`${"─".repeat(64)}`);

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                 401 ROOT CAUSE MATRIX                        ║
╠══════════════════════════════════════════════════════════════╣
║  CAUSE                       │ HTTP  │ MESSAGE               ║
╠══════════════════════════════════════════════════════════════╣
║  No Authorization header     │  401  │ "No token provided"   ║
║  lowercase "bearer " prefix  │  401  │ "No token provided"   ║
║  Doubled "Bearer Bearer"     │  401  │ "Invalid or expired"  ║
║  Expired token               │  401  │ "Invalid or expired"  ║
║  Wrong/different JWT_SECRET  │  401  │ "Invalid or expired"  ║
║  Stale token (user deleted)  │  401  │ "User no longer..."   ║
║  Admin token on user route   │  403  │ "Admin accounts..."   ║
║  Teacher on /job-posts POST  │  403  │ "Only school accounts"║
╚══════════════════════════════════════════════════════════════╝
`);

  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("PROBE ERROR:", e); process.exit(2); });
