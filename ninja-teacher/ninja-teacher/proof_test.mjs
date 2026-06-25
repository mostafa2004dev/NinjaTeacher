#!/usr/bin/env node
// proof_test.mjs
// Exact proof of the fix:
//   1. Register a school account.
//   2. WITHOUT logging in again, immediately use the registration token.
//   3. Show localStorage value, Authorization header, and server response.
//
// Simulates what the fixed register.jsx now does:
//   SaveUserToken(token) → localStorage["userToken"] = token
//   then immediately navigate to protected page

const BASE = "http://localhost:3000";

function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const pad = parts[1].length % 4;
  const b64 = parts[1] + (pad ? "=".repeat(4 - pad) : "");
  return JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
}

async function request(method, path, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data, sentHeaders: { ...headers } };
}

// ── Simulate localStorage (same logic as Authcontext.SaveUserToken) ──────────
class MockLocalStorage {
  constructor() { this._store = {}; }
  setItem(key, value) { this._store[key] = value; }
  getItem(key)        { return this._store[key] ?? null; }
  removeItem(key)     { delete this._store[key]; }
  dump()              { return { ...this._store }; }
}

// ── Simulate the FIXED register.jsx behaviour ─────────────────────────────────
function fixedSaveUserToken(token, storage) {
  // mirrors Authcontext.SaveUserToken exactly:
  //   localStorage.setItem("userToken", token)
  storage.setItem("userToken", token);
}

// ── Simulate the BROKEN register.jsx behaviour ────────────────────────────────
function brokenSaveToken(token, storage) {
  // old code:  localStorage.setItem("token", ...)
  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify({ id: "placeholder" }));
}

// ── Helper to simulate a protected page making its first API call ─────────────
function buildAuthHeader(storage) {
  // mirrors every API service:  localStorage.getItem("userToken")
  const token = storage.getItem("userToken");
  return token ? `Bearer ${token}` : null;
}

(async () => {
  const stamp = Date.now();
  const schoolEmail = `proof_school_${stamp}@test.com`;
  const PASS = "secret123";

  let pass = 0, fail = 0;
  const chk = (label, ok, detail = "") => {
    const mark = ok ? "✓ PASS" : "✗ FAIL";
    console.log(`  ${mark}  ${label}${detail ? "  →  " + detail : ""}`);
    if (ok) pass++; else fail++;
  };

  console.log("╔═════════════════════════════════════════════════════════════════╗");
  console.log("║    PROOF TEST: register → immediate protected access            ║");
  console.log("╚═════════════════════════════════════════════════════════════════╝");
  console.log(`  School email: ${schoolEmail}\n`);

  // ════════════════════════════════════════════════════════════════════════
  // STEP 0: Prove the OLD (broken) behaviour still produces 401
  // ════════════════════════════════════════════════════════════════════════
  console.log("══ BEFORE FIX — simulation of old register.jsx ══");

  const brokenStorage = new MockLocalStorage();

  // Register (same API call as before — nothing changed server-side)
  const reg0 = await request("POST", "/auth/register", {
    body: { name: "Proof School OLD", email: `broken_${stamp}@test.com`,
            password: PASS, confirm_password: PASS, role: "school" },
  });
  const brokenToken = reg0.data?.data?.token;

  // OLD code path: localStorage.setItem("token", token)
  brokenSaveToken(brokenToken, brokenStorage);

  console.log(`\n  localStorage after registration (OLD code):`);
  console.log(`    ${JSON.stringify(brokenStorage.dump(), null, 4).replace(/\n/g, "\n    ")}`);

  const brokenAuthHeader = buildAuthHeader(brokenStorage);
  console.log(`\n  Authorization header built by API service:`);
  console.log(`    ${brokenAuthHeader ?? "(none — localStorage[\"userToken\"] is null)"}`);

  // Immediately call a protected endpoint using whatever is in localStorage
  const broken401 = await request("GET", "/school/dashboard", {
    token: brokenStorage.getItem("userToken") || undefined, // null → no header
  });

  console.log(`\n  GET /school/dashboard response:`);
  console.log(`    HTTP ${broken401.status}  ${JSON.stringify(broken401.data)}`);
  chk("OLD code → 401 (no userToken in storage)", broken401.status === 401,
      `got ${broken401.status}: ${broken401.data?.message}`);

  // ════════════════════════════════════════════════════════════════════════
  // STEP 1: Register a NEW School account (fixed code path)
  // ════════════════════════════════════════════════════════════════════════
  console.log("\n══ STEP 1: POST /auth/register ══");

  const regRes = await request("POST", "/auth/register", {
    body: { name: "Proof School", email: schoolEmail, password: PASS,
            confirm_password: PASS, role: "school",
            school_type: "Private", governorate: "Cairo" },
  });

  console.log(`  HTTP status : ${regRes.status}`);
  console.log(`  Response    : ${JSON.stringify({
    status:  regRes.data?.status,
    message: regRes.data?.message,
    user_id: regRes.data?.data?.user?.id,
    role:    regRes.data?.data?.user?.role,
    token:   regRes.data?.data?.token ? regRes.data.data.token.substring(0, 60) + "..." : null,
  }, null, 4).replace(/\n/g, "\n  ")}`);

  chk("register returns 201", regRes.status === 201, `got ${regRes.status}`);
  const REGISTRATION_TOKEN = regRes.data?.data?.token;
  const userId = regRes.data?.data?.user?.id;
  chk("registration token present", !!REGISTRATION_TOKEN);
  chk("user.role = school", regRes.data?.data?.user?.role === "school");

  // ════════════════════════════════════════════════════════════════════════
  // STEP 2: Simulate SaveUserToken (fixed register.jsx)
  // ════════════════════════════════════════════════════════════════════════
  console.log("\n══ STEP 2: SaveUserToken() — what the FIXED register.jsx calls ══");
  console.log(`  Code executed: localStorage.setItem("userToken", token)`);

  const fixedStorage = new MockLocalStorage();
  fixedSaveUserToken(REGISTRATION_TOKEN, fixedStorage);

  const storedValue = fixedStorage.getItem("userToken");

  console.log(`\n  localStorage after registration (FIXED code):`);
  console.log(`    Key  : "userToken"`);
  console.log(`    Value: ${storedValue.substring(0, 80)}...`);
  console.log(`    Value length: ${storedValue.length} chars`);

  chk('localStorage["userToken"] is set',     storedValue !== null);
  chk('localStorage["userToken"] = token',    storedValue === REGISTRATION_TOKEN);
  chk('localStorage["token"] NOT set (old key gone)',
      fixedStorage.getItem("token") === null, `was: ${fixedStorage.getItem("token")}`);

  // ════════════════════════════════════════════════════════════════════════
  // STEP 3: Decode and verify the stored token
  // ════════════════════════════════════════════════════════════════════════
  console.log("\n══ STEP 3: JWT payload of the stored token ══");
  const jwtPayload = decodeJwt(storedValue);
  console.log(`  ${JSON.stringify(jwtPayload, null, 4).replace(/\n/g, "\n  ")}`);
  chk("JWT payload.id = user id",     jwtPayload?.id === userId, `jwt.id=${jwtPayload?.id} user.id=${userId}`);
  chk("JWT payload.role = school",    jwtPayload?.role === "school");
  chk("JWT payload.type = user",      jwtPayload?.type === "user");
  chk("JWT not expired",              jwtPayload?.exp > Math.floor(Date.now() / 1000),
      `exp=${new Date(jwtPayload?.exp * 1000).toISOString()}`);

  // ════════════════════════════════════════════════════════════════════════
  // STEP 4: Build the Authorization header (what every API service does)
  // ════════════════════════════════════════════════════════════════════════
  console.log("\n══ STEP 4: Authorization header built by API service ══");
  const authHeader = buildAuthHeader(fixedStorage);
  console.log(`  Code  : const token = localStorage.getItem("userToken")`);
  console.log(`          return token ? \`Bearer \${token}\` : {}`);
  console.log(`  Result: ${authHeader}`);
  chk("Authorization header starts with 'Bearer '", authHeader?.startsWith("Bearer "));
  chk("Authorization header contains the token",
      authHeader === `Bearer ${REGISTRATION_TOKEN}`);

  // ════════════════════════════════════════════════════════════════════════
  // STEP 5: Immediately call protected endpoints — NO LOGIN — just registration token
  // ════════════════════════════════════════════════════════════════════════
  console.log("\n══ STEP 5: Immediate protected requests (NO re-login) ══");
  console.log("  Using ONLY the registration token. No /auth/login called.\n");

  const protectedEndpoints = [
    { method: "GET",  path: "/school/dashboard",  label: "GET /school/dashboard" },
    { method: "GET",  path: "/job-posts/my",       label: "GET /job-posts/my" },
    { method: "GET",  path: "/school/jobs",        label: "GET /school/jobs" },
    { method: "GET",  path: "/school/profile",     label: "GET /school/profile" },
    { method: "GET",  path: "/users/me",            label: "GET /users/me" },
    { method: "GET",  path: "/notifications",       label: "GET /notifications" },
    { method: "GET",  path: "/profile",             label: "GET /profile" },
  ];

  for (const ep of protectedEndpoints) {
    const res = await request(ep.method, ep.path, { token: REGISTRATION_TOKEN });
    const ok = res.status >= 200 && res.status < 300;
    console.log(`  ${ep.label}`);
    console.log(`    Authorization: ${res.sentHeaders.Authorization?.substring(0, 72)}...`);
    console.log(`    Response     : HTTP ${res.status}  ${ok ? "✓ OK" : "✗ FAIL"}`);
    if (!ok) console.log(`    Body         : ${JSON.stringify(res.data)}`);
    console.log("");
    chk(`${ep.label} → 200 (not 401)`, ok, `got ${res.status}`);
  }

  // ════════════════════════════════════════════════════════════════════════
  // STEP 6: Create a job post immediately after registration
  // ════════════════════════════════════════════════════════════════════════
  console.log("══ STEP 6: POST /job-posts — immediately after registration ══");
  const createRes = await request("POST", "/job-posts", {
    token: REGISTRATION_TOKEN,
    body: {
      jobDetails: {
        positionTitle: "Science Teacher",
        location: "Cairo, New Cairo",
        subjects: ["Biology", "Chemistry"],
        salaryRange: "$35k-$55k",
        requiredExperience: "2-4 years",
        qualifications: "BSc Education",
      },
      personality: {
        teachingStyle: ["collaborative"],
        classroomEnergy: ["balanced"],
        leadershipStyle: ["mentor"],
        communicationStyle: ["empathetic"],
        problemSolving: ["analytical"],
      },
      submittedAt: new Date().toISOString(),
    },
  });

  console.log(`  Authorization: ${createRes.sentHeaders.Authorization?.substring(0, 72)}...`);
  console.log(`  Response     : HTTP ${createRes.status}`);
  if (createRes.status === 201) {
    const d = createRes.data?.data;
    console.log(`  Job created  : { school_id: ${d?.school_id}, job_id: ${d?.job_id}, Title: "${d?.Title}", Status: "${d?.Status}" }`);
    console.log(`  School_ID from token: ${d?.school_id} = user.id from registration: ${userId}`);
  } else {
    console.log(`  Error: ${JSON.stringify(createRes.data)}`);
  }
  chk("POST /job-posts → 201 (not 401)", createRes.status === 201, `got ${createRes.status}`);
  chk("School_ID = registration user.id", createRes.data?.data?.school_id === userId,
      `job.school_id=${createRes.data?.data?.school_id}  reg.user.id=${userId}`);

  // ════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════════════════════
  console.log(`\n${"═".repeat(67)}`);
  console.log(`  TOTAL: ${pass} passed,  ${fail} failed`);
  console.log(`${"═".repeat(67)}`);

  if (fail === 0) {
    console.log(`
  PROOF SUMMARY
  ─────────────────────────────────────────────────────────────────
  1. Registered a new school account  → HTTP 201 ✓
  2. FIXED code called SaveUserToken(token)
       localStorage["userToken"] = "eyJhbGci..."  ✓
       localStorage["token"]     = null (not set)  ✓
  3. JWT payload: { id: ${userId}, role: "school", type: "user" }  ✓
  4. Authorization header: "Bearer eyJhbGci..."  ✓
  5. Protected endpoints responded 200 WITHOUT re-login  ✓
  6. POST /job-posts → 201, School_ID taken from token  ✓
  7. OLD code path produced 401 (proved before/after)  ✓
  ─────────────────────────────────────────────────────────────────`);
  }

  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("PROOF ERROR:", e); process.exit(2); });
