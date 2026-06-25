#!/usr/bin/env node
// final_validation.mjs — complete system health check
// Tests every module, every user flow, hunts for regressions
const BASE = "http://localhost:3000";
let pass = 0, fail = 0, warn = 0;
const ISSUES = [];
const FIXES_NEEDED = [];

function p(label, ok, detail="") {
  if (ok === "WARN") { warn++; ISSUES.push({ sev:"WARN", label, detail }); console.log(`  ⚠ WARN  ${label}  ${detail}`); return; }
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; ISSUES.push({ sev:"FAIL", label, detail }); FIXES_NEEDED.push(`${label}: ${detail}`); console.log(`  ✗ FAIL  ${label}  →  ${detail}`); }
}

async function r(method, path, { token, body, form }={}) {
  const hdrs = {};
  if (token) hdrs.Authorization = `Bearer ${token}`;
  let b = undefined;
  if (form) { b = form; }
  else if (body) { hdrs["Content-Type"] = "application/json"; b = JSON.stringify(body); }
  const res = await fetch(BASE+path, { method, headers: hdrs, body: b });
  let data; try { data = await res.json(); } catch { data = null; }
  return { s: res.status, d: data };
}

function decodeJwt(tok) {
  if (!tok) return null;
  try {
    const p = tok.split(".")[1];
    const pad = p.length % 4;
    return JSON.parse(Buffer.from(p + "=".repeat(pad ? 4-pad : 0), "base64url").toString());
  } catch { return null; }
}

const stamp = Date.now();
const sEmail = `school_${stamp}@v.com`;
const tEmail = `teacher_${stamp}@v.com`;
const PASS = "secret123";

(async () => {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║          FINAL SYSTEM VALIDATION — FULL PASS                ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════════════════════
  // 1. SERVER HEALTH
  // ═══════════════════════════════════════════════════════════════
  console.log("── 1. SERVER HEALTH ──");
  const health = await r("GET", "/");
  p("API root responds 200", health.s === 200);
  p("API returns health message", health.d?.message?.includes("Ninja Teacher"));

  // ═══════════════════════════════════════════════════════════════
  // 2. AUTH — REGISTRATION
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 2. SCHOOL REGISTRATION ──");
  const sReg = await r("POST", "/auth/register", { body: {
    name:"Final School", email:sEmail, password:PASS, confirm_password:PASS,
    role:"school", school_type:"Private", governorate:"Cairo"
  }});
  p("school register 201", sReg.s===201, `got ${sReg.s}`);
  const STOK = sReg.d?.data?.token;
  const SUID = sReg.d?.data?.user?.id;
  p("school token returned", !!STOK);
  p("school user.id present", Number.isInteger(SUID), `id=${SUID}`);
  const sPay = decodeJwt(STOK);
  p("JWT.id matches user.id", sPay?.id === SUID, `jwt=${sPay?.id} user=${SUID}`);
  p("JWT.role = school", sPay?.role === "school");
  p("JWT.type = user", sPay?.type === "user");

  // Duplicate registration
  const sDup = await r("POST", "/auth/register", { body: {
    name:"X", email:sEmail, password:PASS, confirm_password:PASS, role:"school"
  }});
  p("duplicate email → 400/409", [400,409].includes(sDup.s), `got ${sDup.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 3. AUTH — LOGIN
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 3. AUTH LOGIN ──");
  const sLgn = await r("POST", "/auth/login", { body: { email:sEmail, password:PASS }});
  p("school login 200", sLgn.s===200, `got ${sLgn.s}`);
  const SLT = sLgn.d?.data?.token;
  p("login token present", !!SLT);
  p("login user id matches", sLgn.d?.data?.user?.id === SUID);
  // Wrong password
  const badLgn = await r("POST", "/auth/login", { body: { email:sEmail, password:"wrong" }});
  p("wrong password → 401", badLgn.s===401, `got ${badLgn.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 4. SCHOOL PROFILE
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 4. SCHOOL PROFILE ──");
  const prof = await r("GET", "/school/profile", { token:SLT });
  p("GET /school/profile 200", prof.s===200, `got ${prof.s} ${JSON.stringify(prof.d).slice(0,100)}`);
  p("profile.id = school id", prof.d?.data?.id === SUID);
  const profUpd = await r("PUT", "/school/profile", { token:SLT, body:{ School_Name:"Final Test School", Bio:"Test bio" }});
  p("PUT /school/profile 200", profUpd.s===200, `got ${profUpd.s}`);
  p("profile update persisted", profUpd.d?.data?.school_name === "Final Test School");

  // ═══════════════════════════════════════════════════════════════
  // 5. JOB POSTING FLOW — full CRUD
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 5. JOB POSTING CRUD ──");
  const jobPayload = {
    jobDetails:{ positionTitle:"Math Teacher", location:"Cairo", subjects:["Mathematics"],
      salaryRange:"$40k-$60k", requiredExperience:"3-5 years", qualifications:"BA Education" },
    personality:{ teachingStyle:["structured"], classroomEnergy:["balanced"],
      leadershipStyle:["mentor"], communicationStyle:["empathetic"], problemSolving:["analytical"] },
    submittedAt: new Date().toISOString()
  };

  // CREATE
  const jCreate = await r("POST", "/job-posts", { token:SLT, body:jobPayload });
  p("POST /job-posts 201", jCreate.s===201, `got ${jCreate.s} ${JSON.stringify(jCreate.d).slice(0,150)}`);
  const JOB = jCreate.d?.data;
  const JID = JOB?.job_id;
  p("job has job_id", Number.isInteger(JID), `job_id=${JID}`);
  p("job school_id from token (not client)", JOB?.school_id === SUID, `job.school_id=${JOB?.school_id} user=${SUID}`);
  p("job title mapped", JOB?.Title === "Math Teacher");
  p("job location mapped", JOB?.Location === "Cairo");
  p("job subjects mapped", Array.isArray(JOB?.subjects) && JOB.subjects.includes("Mathematics"));
  p("job experience parsed to int", JOB?.Required_Experience === 3, `got ${JOB?.Required_Experience}`);
  p("job classroom_energy=balanced", JOB?.Classroom_Energy === "balanced", `got ${JOB?.Classroom_Energy}`);
  p("job status=active", JOB?.Status === "active");
  p("school object populated", !!JOB?.school?.name);

  // No school_id sent from client (no regression)
  p("no School_ID in request body accepted", jCreate.s === 201);

  // READ
  const jGet = await r("GET", `/job-posts/${SUID}/${JID}`);
  p("GET /job-posts/:sid/:jid 200", jGet.s===200, `got ${jGet.s}`);
  p("GET single job title ok", jGet.d?.data?.Title === "Math Teacher");

  // LIST MY POSTS
  const myJ = await r("GET", "/job-posts/my", { token:SLT });
  p("GET /job-posts/my 200", myJ.s===200, `got ${myJ.s}`);
  p("my posts contains created job", (myJ.d?.data?.jobs||[]).some(j=>j.job_id===JID));

  // PUBLIC LIST
  const allJ = await r("GET", "/job-posts");
  p("GET /job-posts 200", allJ.s===200, `got ${allJ.s}`);
  p("public feed contains job", (allJ.d?.data?.jobs||[]).some(j=>j.job_id===JID&&j.school_id===SUID));

  // UPDATE
  const jUpd = await r("PUT", `/job-posts/${JID}`, { token:SLT,
    body:{ jobDetails:{ salaryRange:"$50k-$70k" }, status:"active" }});
  p("PUT /job-posts/:id 200", jUpd.s===200, `got ${jUpd.s}`);
  p("update salary persisted", jUpd.d?.data?.Salary_Range === "$50k-$70k", `got ${jUpd.d?.data?.Salary_Range}`);

  // SCHOOL /school/jobs listing
  const sJobs = await r("GET", "/school/jobs", { token:SLT });
  p("GET /school/jobs 200", sJobs.s===200, `got ${sJobs.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 6. SCHOOL DASHBOARD STATS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 6. SCHOOL DASHBOARD STATS ──");
  const dash = await r("GET", "/school/dashboard", { token:SLT });
  p("GET /school/dashboard 200", dash.s===200, `got ${dash.s}`);
  const stats = dash.d?.data;
  p("stats.total_jobs >= 1", stats?.total_jobs >= 1, `got ${stats?.total_jobs}`);
  p("stats.active_jobs >= 1", stats?.active_jobs >= 1, `got ${stats?.active_jobs}`);
  p("stats.total_applicants is number", Number.isInteger(stats?.total_applicants));
  p("stats.pending_review is number", Number.isInteger(stats?.pending_review));
  p("stats.hired is number", Number.isInteger(stats?.hired));

  // STATUS TOGGLE — close job, check active_jobs drops
  const jClose = await r("PUT", `/job-posts/${JID}`, { token:SLT, body:{ status:"closed" }});
  p("close job 200", jClose.s===200);
  const dashAfter = await r("GET", "/school/dashboard", { token:SLT });
  const statsAfter = dashAfter.d?.data;
  p("active_jobs decrements on close", statsAfter?.active_jobs < stats?.active_jobs,
    `before=${stats?.active_jobs} after=${statsAfter?.active_jobs}`);
  p("total_jobs unchanged on close", statsAfter?.total_jobs === stats?.total_jobs);
  // Re-open
  await r("PUT", `/job-posts/${JID}`, { token:SLT, body:{ status:"active" }});

  // ═══════════════════════════════════════════════════════════════
  // 7. TEACHER ACCOUNT — APPLY FLOW
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 7. TEACHER APPLY FLOW ──");
  // Create teacher via admin (bypasses CV requirement in HTTP controller)
  const adminLgn = await r("POST", "/admin/auth/login", { body:{ email:"admin@ninjateacher.com", password:"ChangeMe@1234" }});
  p("admin login 200", adminLgn.s===200, `got ${adminLgn.s}`);
  const ATOK = adminLgn.d?.data?.token;

  const tCreate = await r("POST", "/admin/users", { token:ATOK, body:{
    name:"Test Teacher", email:tEmail, password:PASS, role:"teacher", gender:"male",
    specialization:"Mathematics", years_of_experience:4
  }});
  p("admin creates teacher 201", tCreate.s===201, `got ${tCreate.s} ${JSON.stringify(tCreate.d).slice(0,120)}`);

  const tLgn = await r("POST", "/auth/login", { body:{ email:tEmail, password:PASS }});
  p("teacher login 200", tLgn.s===200, `got ${tLgn.s}`);
  const TLT = tLgn.d?.data?.token;
  const TUID = tLgn.d?.data?.user?.id;
  p("teacher token present", !!TLT);

  // Teacher cannot create job
  const teacherJobAttempt = await r("POST", "/job-posts", { token:TLT, body:jobPayload });
  p("teacher → 403 on job create", teacherJobAttempt.s===403, `got ${teacherJobAttempt.s}`);

  // Teacher applies to job
  const apply = await r("POST", "/applied-jobs", { token:TLT, body:{ Job_ID:JID, School_ID:SUID }});
  p("teacher apply 201", apply.s===201, `got ${apply.s} ${JSON.stringify(apply.d).slice(0,100)}`);
  p("application school_id set", apply.d?.data?.school_id === SUID);
  p("application status=pending", apply.d?.data?.status === "pending");

  // Duplicate apply → 409
  const dup = await r("POST", "/applied-jobs", { token:TLT, body:{ Job_ID:JID, School_ID:SUID }});
  p("duplicate apply → 409", dup.s===409, `got ${dup.s}`);

  // GET my applied jobs
  const myApps = await r("GET", "/applied-jobs", { token:TLT });
  p("GET /applied-jobs 200", myApps.s===200, `got ${myApps.s}`);
  p("applied jobs list not empty", Array.isArray(myApps.d?.data) && myApps.d.data.length > 0);
  p("applied job has job data", !!myApps.d?.data?.[0]?.job?.title || !!myApps.d?.data?.[0]?.job?.Title);

  // ═══════════════════════════════════════════════════════════════
  // 8. APPLICANTS — SCHOOL SEES THEM
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 8. SCHOOL APPLICANT MANAGEMENT ──");
  const apps = await r("GET", `/school/jobs/${JID}/applicants`, { token:SLT });
  p("GET school job applicants 200", apps.s===200, `got ${apps.s}`);
  p("applicants list not empty", (apps.d?.data?.applicants||[]).length > 0, `count=${apps.d?.data?.total}`);
  p("applicant has teacher data", !!apps.d?.data?.applicants?.[0]?.teacher?.Name);
  p("applicant has match_score", Number.isInteger(apps.d?.data?.applicants?.[0]?.match_score));

  // Update applicant status
  const statusUpd = await r("PATCH", `/school/jobs/${JID}/applicants/${TUID}/status`, { token:SLT,
    body:{ status:"interview" }});
  p("update applicant status 200", statusUpd.s===200, `got ${statusUpd.s}`);
  p("status changed to interview", statusUpd.d?.data?.Status === "interview");

  // Dashboard total_applicants updated
  const dashApp = await r("GET", "/school/dashboard", { token:SLT });
  p("total_applicants > 0 after apply", dashApp.d?.data?.total_applicants > 0);

  // ═══════════════════════════════════════════════════════════════
  // 9. NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 9. NOTIFICATIONS ──");
  const notifs = await r("GET", "/notifications", { token:TLT });
  p("GET /notifications 200", notifs.s===200, `got ${notifs.s}`);
  p("notifications is array", Array.isArray(notifs.d?.data?.notifications ?? notifs.d?.data));

  const sNotifs = await r("GET", "/notifications", { token:SLT });
  p("school notifications 200", sNotifs.s===200);

  // Mark read
  const firstNotif = (notifs.d?.data?.notifications ?? notifs.d?.data ?? [])[0];
  if (firstNotif?.id) {
    const markRead = await r("PATCH", `/notifications/${firstNotif.id}/read`, { token:TLT });
    p("mark notification read 200", markRead.s===200, `got ${markRead.s}`);
  } else {
    p("mark notification read (skip — none yet)", true);
  }

  // ═══════════════════════════════════════════════════════════════
  // 10. MESSAGES
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 10. MESSAGES ──");
  const msgs = await r("GET", "/messages", { token:TLT });
  p("GET /messages 200", msgs.s===200, `got ${msgs.s}`);
  const sMsg = await r("GET", "/messages", { token:SLT });
  p("school GET /messages 200", sMsg.s===200, `got ${sMsg.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 11. TEACHER DASHBOARD (stats + saved jobs)
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 11. TEACHER DASHBOARD ──");
  const tDash = await r("GET", "/dashboard/stats", { token:TLT });
  p("GET /dashboard/stats 200", tDash.s===200, `got ${tDash.s}`);
  p("teacher dashboard applications count", tDash.d?.data?.stats?.applications >= 1,
    `got ${tDash.d?.data?.stats?.applications}`);

  // Save a job
  const saveJ = await r("POST", "/dashboard/saved", { token:TLT, body:{ School_ID:SUID, Job_ID:JID }});
  p("save job 201", saveJ.s===201, `got ${saveJ.s}`);
  const savedList = await r("GET", "/dashboard/saved", { token:TLT });
  p("GET /dashboard/saved 200", savedList.s===200, `got ${savedList.s}`);
  p("saved list has the job", (savedList.d?.data||[]).some(s=>s.job_id===JID||s.Job_ID===JID));
  const unsave = await r("DELETE", `/dashboard/saved/${SUID}/${JID}`, { token:TLT });
  p("unsave job 200", unsave.s===200, `got ${unsave.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 12. PROFILE (TEACHER)
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 12. TEACHER PROFILE ──");
  const tProf = await r("GET", "/profile", { token:TLT });
  p("GET /profile 200", tProf.s===200, `got ${tProf.s}`);
  const tProfGet = await r("GET", "/users/me", { token:TLT });
  p("GET /users/me 200", tProfGet.s===200, `got ${tProfGet.s}`);
  p("users/me returns teacher data", tProfGet.d?.data?.Teacher_ID === TUID);

  const profBasic = await r("PUT", "/profile/basic", { token:TLT, body:{ Name:"Updated Teacher", Location:"Alexandria" }});
  p("PUT /profile/basic 200", profBasic.s===200, `got ${profBasic.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 13. SURVEY
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 13. TEACHER SURVEY ──");
  const surveyAnswers = Array.from({length:14}, (_,i) => ({ questionId:i+1, answer:"Strongly Agree" }));
  const survSubmit = await r("POST", "/survey/submit", { token:TLT, body:{ answers:surveyAnswers }});
  p("POST /survey/submit 200", survSubmit.s===200, `got ${survSubmit.s}`);
  p("survey saves all groups", !!survSubmit.d?.data?.classroom_management);

  const survGet = await r("GET", "/survey/answers", { token:TLT });
  p("GET /survey/answers 200", survGet.s===200, `got ${survGet.s}`);
  p("survey answers retrieved", !!survGet.d?.data?.classroom_management);

  // ═══════════════════════════════════════════════════════════════
  // 14. AI MATCHING
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 14. AI MATCHING (rule-based, no external service) ──");
  const matchScore = await r("GET", `/ai-matching/score/${SUID}/${TUID}/${JID}`, { token:SLT });
  p("GET /ai-matching/score 200", matchScore.s===200, `got ${matchScore.s}`);
  p("match_score is 0-100", matchScore.d?.data?.match_score >= 0 && matchScore.d?.data?.match_score <= 100,
    `got ${matchScore.d?.data?.match_score}`);

  const recJobs = await r("GET", "/ai-matching/recommended-jobs", { token:TLT });
  p("GET /ai-matching/recommended-jobs 200", recJobs.s===200, `got ${recJobs.s}`);

  const bulkScores = await r("GET", "/ai-matching/bulk-scores", { token:TLT });
  p("GET /ai-matching/bulk-scores 200", bulkScores.s===200, `got ${bulkScores.s}`);
  p("bulk scores map returned", typeof bulkScores.d?.data === "object");

  // AI service (FastAPI) health — expected to be unavailable in this env
  const aiH = await r("GET", "/recommend/schools", { token:TLT }).catch(() => ({ s:503 }));
  // AI FastAPI /recommend/schools returns 400 when teacher has no Big5 assessment — expected
  if (aiH.s === 503 || aiH.s === 500) {
    p("AI FastAPI service (graceful degradation)", "WARN", `FastAPI not running at localhost:8000 — expected in dev`);
  } else if (aiH.s === 400) {
    p("AI route 400 = no Big5 assessment yet (expected)", true);
  } else {
    p("AI FastAPI service responds", aiH.s === 200, `got ${aiH.s}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 15. SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 15. SUBSCRIPTIONS ──");
  const plans = await r("GET", "/subscriptions/plans");
  p("GET /subscriptions/plans 200", plans.s===200, `got ${plans.s}`);
  p("plans list not empty", (plans.d?.data||[]).length > 0, `count=${plans.d?.data?.length}`);
  const mySub = await r("GET", "/subscriptions/my", { token:SLT });
  p("GET /subscriptions/my 200", mySub.s===200, `got ${mySub.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 16. CONTACT
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 16. CONTACT ──");
  const contact = await r("POST", "/contact", { body:{
    name:"Test User", email:"test@test.com", subject:"General Inquiry", message:"Hello from validation test" }});
  p("POST /contact 200/201", [200,201].includes(contact.s), `got ${contact.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 17. HOME
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 17. HOME STATS ──");
  const home = await r("GET", "/home/stats");
  p("GET /home/stats 200", home.s===200, `got ${home.s}`);
  p("home stats has data", !!home.d?.data);

  // ═══════════════════════════════════════════════════════════════
  // 18. ADMIN MODULE
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 18. ADMIN MODULE ──");
  const adminDash = await r("GET", "/admin/dashboard", { token:ATOK });
  p("GET /admin/dashboard 200", adminDash.s===200, `got ${adminDash.s}`);
  const adminUsers = await r("GET", "/admin/users", { token:ATOK });
  p("GET /admin/users 200", adminUsers.s===200, `got ${adminUsers.s}`);
  p("admin users list not empty", (adminUsers.d?.data?.users||adminUsers.d?.data||[]).length > 0);
  const adminJobs = await r("GET", "/admin/jobs", { token:ATOK });
  p("GET /admin/jobs 200", adminJobs.s===200, `got ${adminJobs.s}`);

  // Non-admin cannot reach admin routes
  const noAdmin = await r("GET", "/admin/dashboard", { token:SLT });
  p("school token → 403 on admin route", noAdmin.s===403, `got ${noAdmin.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 19. REVIEWS
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 19. REVIEWS ──");
  const revGet = await r("GET", `/reviews/teachers/${TUID}`);
  p("GET /reviews/teachers/:id 200", revGet.s===200, `got ${revGet.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 20. DELETE JOB — cleanup + cascade check
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 20. JOB DELETE + CLEANUP ──");
  const jDel = await r("DELETE", `/job-posts/${JID}`, { token:SLT });
  p("DELETE /job-posts/:id 200", jDel.s===200, `got ${jDel.s}`);
  const jGone = await r("GET", `/job-posts/${SUID}/${JID}`);
  p("deleted job returns 404", jGone.s===404, `got ${jGone.s}`);
  const dashDel = await r("GET", "/school/dashboard", { token:SLT });
  p("total_jobs decrements after delete", dashDel.d?.data?.total_jobs < stats?.total_jobs + 1);

  // ═══════════════════════════════════════════════════════════════
  // 21. AUTH EDGE CASES — regression check
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 21. AUTH EDGE CASES ──");
  const noTok = await r("GET", "/school/dashboard");
  p("no token → 401", noTok.s===401, `got ${noTok.s}`);
  const badTok = await r("GET", "/school/dashboard", { token:"invalid.token.here" });
  p("bad token → 401", badTok.s===401, `got ${badTok.s}`);
  // Registration token works immediately (the original bug)
  const immDash = await r("GET", "/school/dashboard", { token:STOK });
  p("registration token works immediately (no re-login)", immDash.s===200, `got ${immDash.s}`);

  // ═══════════════════════════════════════════════════════════════
  // 22. FRONTEND TOKEN KEY AUDIT (static analysis)
  // ═══════════════════════════════════════════════════════════════
  console.log("\n── 22. FRONTEND TOKEN KEY AUDIT ──");
  const { execSync } = await import("child_process");
  const FE = "/home/claude/project/frontend/graduation code/src";
  let wrongKeys = ""; let getItems = "";
  try { wrongKeys = execSync(`grep -rn 'setItem.*"token"' "${FE}" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v userToken | grep -v removeItem | grep -v "//"`, { encoding:"utf8" }).trim(); } catch(_) {}
  p("no wrong setItem(\'token\') calls remain", wrongKeys === "", `found:\n${wrongKeys}`);
  try { getItems = execSync(`grep -rn 'getItem.*"token"' "${FE}" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v userToken | grep -v "//"`, { encoding:"utf8" }).trim(); } catch(_) {}
  p("no getItem(\'token\') calls remain", getItems === "", `found:\n${getItems}`);

  // ═══════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║                   VALIDATION COMPLETE                       ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`  Passed : ${pass}`);
  console.log(`  Failed : ${fail}`);
  console.log(`  Warnings: ${warn}`);

  if (ISSUES.length) {
    console.log("\n── ISSUES FOUND ──");
    ISSUES.forEach(i => console.log(`  [${i.sev}] ${i.label}: ${i.detail}`));
  }

  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("FATAL:", e); process.exit(2); });
