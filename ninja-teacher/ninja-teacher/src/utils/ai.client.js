// ═══════════════════════════════════════════════════════════════════════
//  ai.client.js  —  عميل موحّد للاتصال بخدمة الـ AI (FastAPI)
//  ضعه في:  src/utils/ai.client.js
//  يتطلب Node 18+ (fetch مدمجة). لا حزم جديدة.
//
//  .env (Node):
//    AI_SERVICE_URL=http://localhost:8000
//    AI_SERVICE_KEY=
//    AI_TIMEOUT_MS=8000
//    AI_RETRIES=2
// ═══════════════════════════════════════════════════════════════════════

const BASE    = process.env.AI_SERVICE_URL || "http://localhost:8000";
const KEY     = process.env.AI_SERVICE_KEY || "";
const TIMEOUT = parseInt(process.env.AI_TIMEOUT_MS || "8000", 10);
const RETRIES = parseInt(process.env.AI_RETRIES || "2", 10);

async function call(path, { method = "GET", body } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(KEY ? { "X-API-Key": KEY } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || data.detail || `AI service ${res.status}`;
        if (res.status === 400 || res.status === 401 || res.status === 404) throw new Error(msg);
        lastErr = new Error(msg);
        continue; // أعد المحاولة لأخطاء الخادم فقط
      }
      return data;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err.name === "AbortError" ? new Error(`AI timeout ${TIMEOUT}ms`) : err;
      if (attempt < RETRIES) await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw new Error(`AI service unreachable at ${BASE}. ${lastErr?.message || ""}`.trim());
}

module.exports = {
  health:            ()                 => call("/health"),
  predict:           (answers)          => call("/ai/predict", { method: "POST", body: answers }),
  match:             (payload)          => call("/ai/match",   { method: "POST", body: payload }),
  teachersForSchool: (schoolId, limit)  => call(`/recommend/teachers/${encodeURIComponent(schoolId)}?limit=${limit||10}`),
  matchTeachersForSchool: (payload)     => call("/school/match-teachers", { method: "POST", body: payload }),
  matchFromWizard:   (payload)          => call("/school/match-from-wizard", { method: "POST", body: payload }),
  schoolQuestions:   ()                 => call("/school/questions"),
  analyticsOverview: ()                 => call("/analytics/overview"),
  analyticsPredict:  ()                 => call("/analytics/predictions"),
  // ── Enhancement endpoints ──────────────────────────────────────────────
  extractTraits:           (ua)         => call("/ai/extract-traits",            { method: "POST", body: { ua } }),
  personalityStageScore:   (payload)    => call("/ai/personality-stage-score",   { method: "POST", body: payload }),
  recommendJobsForTeacher: (payload)    => call("/ai/recommend-jobs-for-teacher",{ method: "POST", body: payload }),
  stageProfiles:           ()           => call("/ai/stage-profiles"),
};

