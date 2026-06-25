const BASE = "http://localhost:3000";
const log  = (label, val) => console.log(`\n[${label}]\n${JSON.stringify(val, null, 2)}`);

async function req(method, path, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data, ok: res.status >= 200 && res.status < 300 };
}

function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const pad = parts[1].length % 4;
  const b64 = parts[1] + (pad ? "=".repeat(4 - pad) : "");
  return JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
}

(async () => {
  const stamp = Date.now();
  const email = `diag_${stamp}@test.com`;
  const pass  = "secret123";
  let fail = 0;

  const chk = (label, cond, detail = "") => {
    const mark = cond ? "✓ PASS" : "✗ FAIL";
    console.log(`  ${mark}  ${label}` + (detail ? `  [${detail}]` : ""));
    if (!cond) fail++;
  };

  console.log("=================================================");
  console.log("AUTH DIAGNOSTIC: " + new Date().toISOString());
  console.log("=================================================");

  // ── 1. REGISTER ────────────────────────────────────────────────────────
  console.log("\n── 1. REGISTER ──");
  const reg = await req("POST", "/auth/register", {
    body: { name: "Diag School", email, password: pass, confirm_password: pass,
            role: "school", governorate: "Cairo", school_type: "International" },
  });
  log("register response", { status: reg.status, data: reg.data });
  chk("register returns 201",    reg.status === 201, `got ${reg.status}`);
  chk("register data.status ok", reg.data?.status === "success");
  const regToken = reg.data?.data?.token;
  const regUser  = reg.data?.data?.user;
  chk("register returns token",  !!regToken, `len=${regToken?.length}`);
  chk("register user.role=school", regUser?.role === "school", `role=${regUser?.role}`);
  chk("register user.id is int", Number.isInteger(regUser?.id), `id=${regUser?.id}`);

  // ── 2. DECODE REGISTER TOKEN ────────────────────────────────────────────
  console.log("\n── 2. TOKEN DECODE (register) ──");
  const regPayload = decodeJwt(regToken);
  log("register JWT payload", regPayload);
  chk("JWT has id",        Number.isInteger(regPayload?.id), `id=${regPayload?.id}`);
  chk("JWT id matches user.id", regPayload?.id === regUser?.id, `jwt.id=${regPayload?.id} user.id=${regUser?.id}`);
  chk("JWT role=school",   regPayload?.role === "school", `role=${regPayload?.role}`);
  chk("JWT type=user",     regPayload?.type === "user",   `type=${regPayload?.type}`);

  // ── 3. LOGIN ────────────────────────────────────────────────────────────
  console.log("\n── 3. LOGIN ──");
  const lgn = await req("POST", "/auth/login", { body: { email, password: pass } });
  log("login response", { status: lgn.status, data: lgn.data });
  chk("login returns 200",     lgn.status === 200, `got ${lgn.status}`);
  const token   = lgn.data?.data?.token;
  const user    = lgn.data?.data?.user;
  chk("login returns token",   !!token, `len=${token?.length}`);
  chk("login user.id matches", user?.id === regUser?.id, `login.id=${user?.id} reg.id=${regUser?.id}`);
  chk("login role=school",     user?.role === "school");

  // ── 4. DECODE LOGIN TOKEN ────────────────────────────────────────────────
  console.log("\n── 4. TOKEN DECODE (login) ──");
  const payload = decodeJwt(token);
  log("login JWT payload", payload);
  chk("login JWT id is int",       Number.isInteger(payload?.id),     `id=${payload?.id}`);
  chk("login JWT id matches user", payload?.id === user?.id,          `jwt=${payload?.id} user=${user?.id}`);
  chk("login JWT role=school",     payload?.role === "school");
  chk("login JWT type=user",       payload?.type === "user");

  // ── 5. PROTECTED ROUTE: GET /school/dashboard ───────────────────────────
  console.log("\n── 5. PROTECTED ROUTE — /school/dashboard ──");
  const dash = await req("GET", "/school/dashboard", { token });
  log("dashboard response", { status: dash.status, data: dash.data });
  chk("dashboard 200 with valid token", dash.status === 200, `got ${dash.status}`);
  chk("dashboard not 401",              dash.status !== 401, `got ${dash.status}`);

  // ── 6. PROTECTED ROUTE: GET /job-posts/my ───────────────────────────────
  console.log("\n── 6. PROTECTED ROUTE — /job-posts/my ──");
  const my = await req("GET", "/job-posts/my", { token });
  log("/job-posts/my response", { status: my.status, data: my.data });
  chk("GET /job-posts/my 200", my.status === 200, `got ${my.status}`);
  chk("my not 401",            my.status !== 401, `got ${my.status}`);

  // ── 7. CREATE JOB POST ───────────────────────────────────────────────────
  console.log("\n── 7. POST /job-posts (create job) ──");
  const createBody = {
    jobDetails: {
      positionTitle: "Math Teacher",
      location: "Cairo",
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
  const create = await req("POST", "/job-posts", { token, body: createBody });
  log("create job response", { status: create.status, data: create.data });
  chk("create job 201",                   create.status === 201, `got ${create.status}`);
  chk("create not 401",                   create.status !== 401, `got ${create.status}`);
  chk("job school_id from token",         create.data?.data?.school_id === user?.id, `job.school_id=${create.data?.data?.school_id} user.id=${user?.id}`);
  chk("job title correct",                create.data?.data?.Title === "Math Teacher");
  chk("job classroom_energy=balanced",    create.data?.data?.Classroom_Energy === "balanced");
  const jobId = create.data?.data?.job_id;
  chk("job has job_id",                   Number.isInteger(jobId), `job_id=${jobId}`);

  // ── 8. VERIFY JOB IN DB ──────────────────────────────────────────────────
  console.log("\n── 8. VERIFY JOB PERSISTED ──");
  const get = await req("GET", `/job-posts/${user?.id}/${jobId}`);
  log("get job response", { status: get.status, data: get.data });
  chk("get job by id 200",  get.status === 200);
  chk("get job title ok",   get.data?.data?.Title === "Math Teacher");

  // ── 9. NO TOKEN → must be 401 ────────────────────────────────────────────
  console.log("\n── 9. NEGATIVE: no token → 401 ──");
  const noTok = await req("POST", "/job-posts", { body: createBody });
  log("no-token response", { status: noTok.status, data: noTok.data });
  chk("no token → 401",  noTok.status === 401, `got ${noTok.status}`);

  // ── 10. WRONG TOKEN → must be 401 ────────────────────────────────────────
  console.log("\n── 10. NEGATIVE: wrong token → 401 ──");
  const bad = await req("GET", "/school/dashboard", { token: "Bearer wrong.token.here" });
  chk("bad token → 401", bad.status === 401, `got ${bad.status}`);

  // ── 11. TEACHER account cannot create job → 403 ──────────────────────────
  // Teacher registration via HTTP requires CV (multipart), so we create the teacher
  // via the admin API (POST /admin/users) which bypasses the controller CV guard.
  // Then login as that teacher and attempt job creation — expect 403.
  console.log("\n── 11. NEGATIVE: teacher account → 403 on job create ──");
  const adminLogin = await req("POST", "/admin/auth/login", {
    body: { email: "admin@ninjateacher.com", password: "ChangeMe@1234" }
  });
  const adminToken = adminLogin.data?.data?.token;
  chk("admin login for test setup", !!adminToken, `status=${adminLogin.status}`);

  const teacherEmail = `teacher_${stamp}@test.com`;
  const tCreate = await req("POST", "/admin/users", {
    token: adminToken,
    body: { name: "Test Teacher", email: teacherEmail, password: pass, role: "teacher", gender: "male" }
  });
  chk("admin creates teacher", tCreate.status === 201, `status=${tCreate.status} ${JSON.stringify(tCreate.data)}`);

  const tLogin = await req("POST", "/auth/login", { body: { email: teacherEmail, password: pass } });
  const tToken = tLogin.data?.data?.token;
  chk("teacher login ok", !!tToken, `status=${tLogin.status}`);

  const deny = await req("POST", "/job-posts", { token: tToken, body: createBody });
  log("teacher create job response", { status: deny.status, data: deny.data });
  chk("teacher → 403 on job create", deny.status === 403, `got ${deny.status}`);

  // ── SUMMARY ─────────────────────────────────────────────────────────────
  console.log("\n=================================================");
  console.log(`DIAGNOSTIC RESULT: ${fail === 0 ? "ALL CHECKS PASSED ✓" : `${fail} CHECKS FAILED ✗`}`);
  console.log("=================================================");
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("RUNNER ERROR:", e); process.exit(2); });
