// End-to-end test runner for the Job Posting / Create Post flow.
// Uses global fetch (Node 18+). Exits non-zero on any failed assertion.
const BASE = "http://localhost:3000";

let passed = 0, failed = 0;
const results = [];
function check(name, cond, detail = "") {
  if (cond) { passed++; results.push(`PASS  ${name}`); }
  else { failed++; results.push(`FAIL  ${name}  ${detail}`); }
}
async function j(method, path, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

(async () => {
  const stamp = Date.now();
  const email = `school_${stamp}@test.com`;

  // 1) Register a SCHOOL account
  let r = await j("POST", "/auth/register", {
    body: {
      name: "Cairo International School", email, password: "secret123",
      confirm_password: "secret123", role: "school",
      governorate: "Cairo", city: "Nasr City", school_type: "International",
    },
  });
  check("register school -> 201", r.status === 201, `status=${r.status} ${JSON.stringify(r.data)}`);
  check("register returns school role", r.data?.data?.user?.role === "school", JSON.stringify(r.data?.data?.user));

  // 2) Login
  r = await j("POST", "/auth/login", { body: { email, password: "secret123" } });
  check("login -> 200", r.status === 200, `status=${r.status}`);
  const token = r.data?.data?.token;
  const schoolId = r.data?.data?.user?.id;
  check("login returns token", !!token);
  check("login returns school id", Number.isInteger(schoolId), `id=${schoolId}`);

  // 3) Baseline dashboard stats
  r = await j("GET", "/school/dashboard", { token });
  check("dashboard before -> 200", r.status === 200, `status=${r.status} ${JSON.stringify(r.data)}`);
  const statsBefore = r.data?.data?.stats || r.data?.stats || r.data?.data || {};
  const totalBefore = statsBefore.total_jobs ?? 0;
  const activeBefore = statsBefore.active_jobs ?? 0;

  // 4) CREATE POST (job) — exact frontend wizard payload shape, NO School_ID sent
  const createPayload = {
    jobDetails: {
      positionTitle: "High School Math Teacher",
      location: "Cairo, Nasr City",
      subjects: ["Mathematics", "Physics"],
      salaryRange: "$40,000 - $60,000 per year",
      requiredExperience: "3-5 years",
      qualifications: "Bachelor's in Education, Teaching License",
      startDate: "2026-09-01",
      additionalInfo: "Join our growing STEM department.",
    },
    personality: {
      teachingStyle: ["structured"],
      classroomEnergy: ["balanced"],          // <- previously rejected by enum
      leadershipStyle: ["mentor", "leader"],
      communicationStyle: ["empathetic"],
      problemSolving: ["analytical", "creative"],
    },
    submittedAt: new Date().toISOString(),
  };
  r = await j("POST", "/job-posts", { token, body: createPayload });
  check("create job -> 201", r.status === 201, `status=${r.status} ${JSON.stringify(r.data)}`);
  const job = r.data?.data;
  check("created job has school_id from token", job?.school_id === schoolId, `school_id=${job?.school_id} expected=${schoolId}`);
  check("created job has job_id", Number.isInteger(job?.job_id), `job_id=${job?.job_id}`);
  check("created job title mapped", job?.Title === "High School Math Teacher", `Title=${job?.Title}`);
  check("created job location mapped", job?.Location === "Cairo, Nasr City");
  check("created job subjects mapped", Array.isArray(job?.subjects) && job.subjects.includes("Mathematics"));
  check("created job experience parsed to int", job?.Required_Experience === 3, `exp=${job?.Required_Experience}`);
  check("created job classroom_energy=balanced persisted", job?.Classroom_Energy === "balanced", `ce=${job?.Classroom_Energy}`);
  check("created job leadership first-of-array", job?.Leadership_Style === "mentor", `ls=${job?.Leadership_Style}`);
  check("created job status active", job?.Status === "active");
  const firstJobId = job?.job_id;

  // 5) Verify DB persistence directly via GET single
  r = await j("GET", `/job-posts/${schoolId}/${firstJobId}`);
  check("get single job -> 200", r.status === 200, `status=${r.status}`);
  check("single job matches title", r.data?.data?.Title === "High School Math Teacher");

  // 6) Verify it appears in GET /job-posts/my
  r = await j("GET", "/job-posts/my", { token });
  check("get my posts -> 200", r.status === 200);
  const myJobs = r.data?.data?.jobs || [];
  check("my posts contains created job", myJobs.some(x => x.job_id === firstJobId), `count=${myJobs.length}`);

  // 7) Verify it appears in public GET /job-posts
  r = await j("GET", "/job-posts");
  check("get all posts -> 200", r.status === 200);
  const allJobs = r.data?.data?.jobs || [];
  check("public feed contains created job", allJobs.some(x => x.job_id === firstJobId && x.school_id === schoolId));

  // 8) Verify it appears via school module listing
  r = await j("GET", "/school/jobs", { token });
  check("school jobs listing -> 200", r.status === 200, `status=${r.status}`);

  // 9) Create a SECOND post -> Job_ID must auto-increment per school
  const payload2 = JSON.parse(JSON.stringify(createPayload));
  payload2.jobDetails.positionTitle = "Science Lab Coordinator";
  payload2.personality.classroomEnergy = ["energetic"];
  r = await j("POST", "/job-posts", { token, body: payload2 });
  check("create 2nd job -> 201", r.status === 201, `status=${r.status} ${JSON.stringify(r.data)}`);
  check("2nd job_id increments", r.data?.data?.job_id === firstJobId + 1, `got=${r.data?.data?.job_id} expected=${firstJobId + 1}`);

  // 10) Dashboard stats update after creation
  r = await j("GET", "/school/dashboard", { token });
  const statsAfter = r.data?.data?.stats || r.data?.stats || r.data?.data || {};
  check("dashboard total_jobs +2", (statsAfter.total_jobs ?? 0) === totalBefore + 2, `before=${totalBefore} after=${statsAfter.total_jobs}`);
  check("dashboard active_jobs +2", (statsAfter.active_jobs ?? 0) === activeBefore + 2, `before=${activeBefore} after=${statsAfter.active_jobs}`);

  // 11) Negative: missing required position title -> validation 400
  const bad = JSON.parse(JSON.stringify(createPayload));
  bad.jobDetails.positionTitle = "";
  r = await j("POST", "/job-posts", { token, body: bad });
  check("missing title -> 400 validation", r.status === 400, `status=${r.status}`);

  // 12) Negative: no token -> 401 (cannot post without auth, School_ID unobtainable)
  r = await j("POST", "/job-posts", { body: createPayload });
  check("no token -> 401", r.status === 401, `status=${r.status}`);

  // 13) Regression: update one of the jobs (PUT) via job-posts route
  r = await j("PUT", `/job-posts/${firstJobId}`, { token, body: { jobDetails: { salaryRange: "$50,000 - $70,000" } } });
  check("update job -> 200", r.status === 200, `status=${r.status} ${JSON.stringify(r.data)}`);
  check("update applied", r.data?.data?.Salary_Range === "$50,000 - $70,000", `sr=${r.data?.data?.Salary_Range}`);

  // 14) Regression: toggle status to closed, confirm dashboard active count drops
  r = await j("PUT", `/job-posts/${firstJobId}`, { token, body: { status: "closed" } });
  check("close job -> 200", r.status === 200);
  r = await j("GET", "/school/dashboard", { token });
  const statsClosed = r.data?.data?.stats || r.data?.stats || r.data?.data || {};
  check("active_jobs drops after close", (statsClosed.active_jobs ?? 0) === activeBefore + 1, `active=${statsClosed.active_jobs}`);
  check("total_jobs unchanged after close", (statsClosed.total_jobs ?? 0) === totalBefore + 2, `total=${statsClosed.total_jobs}`);

  // 15) Regression: delete the second job
  r = await j("DELETE", `/job-posts/${firstJobId + 1}`, { token });
  check("delete job -> 200", r.status === 200, `status=${r.status}`);
  r = await j("GET", "/job-posts/my", { token });
  const remaining = (r.data?.data?.jobs || []).map(x => x.job_id);
  check("deleted job no longer listed", !remaining.includes(firstJobId + 1), `remaining=${remaining}`);

  console.log("\n================ E2E RESULTS ================");
  console.log(results.join("\n"));
  console.log("============================================");
  console.log(`TOTAL: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
})().catch(e => { console.error("RUNNER ERROR:", e); process.exit(2); });
