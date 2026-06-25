// ═══════════════════════════════════════════════════════════════════════
//  aiInsights.routes.js  —  موديول جديد (إضافة فقط، لا يكسر شيئًا)
//  ضعه في:  src/modules/aiInsights/aiInsights.routes.js
//
//  يضيف الـ endpoints المطلوبة في البرومبت:
//     GET  /recommend/schools            توصية مدارس للمعلم الحالي (من آخر assessment)
//     GET  /recommend/teachers/:schoolId أفضل المعلمين لمدرسة
//     GET  /analytics/overview           إحصائيات النظام
//     GET  /analytics/predictions        توقعات
//     POST /ai/analyze                   تحليل إجابات مباشرة
//
//  التركيب في src/app.js (سطر واحد، لا يغيّر أي route قائم):
//     const aiInsightsRoutes = require("./modules/aiInsights/aiInsights.routes");
//     app.use(aiInsightsRoutes);   // الـ paths كاملة بالداخل
// ═══════════════════════════════════════════════════════════════════════

const express = require("express");
const router  = express.Router();

const ai = require("../../utils/ai.client");
// نموذج الـ Assessment القائم (يحتوي على إجابات المعلم) — لا تعديل عليه
let Assessment;
try { Assessment = require("../assessment/assessment.model"); } catch (_) { Assessment = null; }

// (اختياري) حماية: استخدم middleware المصادقة القائم لو حابب
let protect = (req, res, next) => next();
try { protect = require("../../middlewares/auth.middleware").protect; } catch (_) {}

// ── helper: هات آخر إجابات assessment للمعلم ─────────────────────────────
async function latestAnswers(teacherId) {
  if (!Assessment) throw new Error("Assessment model not available");
  const row = await Assessment.findOne({
    where: { teacher_id: teacherId, status: "completed" },
    order: [["createdAt", "DESC"]],
  });
  if (!row || !row.answers) throw new Error("لا يوجد تقييم مكتمل لهذا المعلم بعد.");
  // الـ DB قد تخزن الإجابات كنص JSON — حوّلها لكائن دائمًا
  return typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers;
}

// ── GET /recommend/schools  (للمعلم الحالي) ──────────────────────────────
router.get("/recommend/schools", protect, async (req, res) => {
  try {
    const answers = await latestAnswers(req.user.Teacher_ID);
    const data = await ai.match({
      answers,
      city:    req.query.city,
      type:    req.query.type,
      subject: req.query.subject,
      top_n:   parseInt(req.query.limit || "10", 10),
    });
    res.json({ status: "success", data: data.recommended_schools, total: data.total_matches });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
});

// ── GET /recommend/teachers/:schoolId ────────────────────────────────────
router.get("/recommend/teachers/:schoolId", protect, async (req, res) => {
  // Try the Python AI service first (it has its own CSV-based school dataset).
  // If the school ID is not found there (real DB school IDs don't exist in CSV),
  // fall back to the Node.js DB-backed matching engine.
  try {
    const data = await ai.teachersForSchool(req.params.schoolId, req.query.limit);
    return res.json({ status: "success", data });
  } catch (_aiErr) { /* school not in CSV dataset — fall through to DB matching */ }

  try {
    const { getMatchesForJob } = require("../aiMatching/aiMatching.service");
    const Post    = require("../jobPosts/jobPosts.model");
    const schoolId = parseInt(req.params.schoolId, 10);
    const limit    = parseInt(req.query.limit || "10", 10);

    const jobs = await Post.findAll({ where: { School_ID: schoolId, Status: "active" } });
    if (!jobs.length) return res.json({ status: "success", data: [] });

    // Collect all matches across jobs, keep best score per teacher
    const bestByTeacher = {};
    for (const job of jobs) {
      const { matches } = await getMatchesForJob(schoolId, job.Job_ID, 50);
      for (const m of matches) {
        const tid = m.teacher.Teacher_ID;
        if (!bestByTeacher[tid] || m.match_score > bestByTeacher[tid].match_score) {
          bestByTeacher[tid] = m;
        }
      }
    }
    const ranked = Object.values(bestByTeacher)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);

    return res.json({ status: "success", data: ranked });
  } catch (err) {
    return res.status(500).json({ status: "fail", message: err.message });
  }
});

// ── GET /analytics/overview ──────────────────────────────────────────────
router.get("/analytics/overview", async (_req, res) => {
  try { res.json({ status: "success", data: await ai.analyticsOverview() }); }
  catch (err) { res.status(502).json({ status: "fail", message: err.message }); }
});

// ── GET /analytics/predictions ───────────────────────────────────────────
router.get("/analytics/predictions", async (_req, res) => {
  try { res.json({ status: "success", data: await ai.analyticsPredict() }); }
  catch (err) { res.status(502).json({ status: "fail", message: err.message }); }
});

// ── POST /ai/analyze  (تحليل إجابات تُرسل مباشرة) ─────────────────────────
router.post("/ai/analyze", protect, async (req, res) => {
  try { res.json({ status: "success", data: await ai.predict(req.body) }); }
  catch (err) {
    const code = err.message.includes("Missing") ? 400 : 502;
    res.status(code).json({ status: "fail", message: err.message });
  }
});

// ── POST /ai/match-teachers  (المدرسة تجاوب الـ5 أسئلة → معلمين مقبولين بالسكور) ──
router.post("/ai/match-teachers", protect, async (req, res) => {
  try {
    // ممكن المدرسة تبعت أسئلتها مباشرة، أو نجيب موادها من بروفايلها
    const data = await ai.matchTeachersForSchool(req.body);
    res.json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("Missing") ? 400 : 502;
    res.status(code).json({ status: "fail", message: err.message });
  }
});

// ── GET /ai/school-questions  (الأسئلة الـ5 وخياراتها) ──
router.get("/ai/school-questions", async (_req, res) => {
  try { res.json({ status: "success", data: await ai.schoolQuestions() }); }
  catch (err) { res.status(502).json({ status: "fail", message: err.message }); }
});

// ── POST /ai/match-from-wizard  (صفات الـ wizard مباشرة → معلمين مقبولين) ──
// يستقبل { jobDetails, personality } من صفحة إنشاء الوظيفة كما هي
router.post("/ai/match-from-wizard", protect, async (req, res) => {
  try {
    const data = await ai.matchFromWizard(req.body);
    res.json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("Missing") ? 400 : 502;
    res.status(code).json({ status: "fail", message: err.message });
  }
});

module.exports = router;
