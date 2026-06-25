const aiService = require("./aiMatching.service");

// GET /ai-matching/job/:schoolId/:jobId/matches — admin view
exports.getMatchesForJob = async (req, res) => {
  try {
    const { schoolId, jobId } = req.params;
    const data = await aiService.getMatchesForJob(schoolId, jobId, req.query.limit);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// GET /ai-matching/score/:schoolId/:teacherId/:jobId — teacher sees their match %
exports.getMatchScore = async (req, res) => {
  const { schoolId, teacherId, jobId } = req.params;
  if (!teacherId || !schoolId || !jobId) {
    return res.status(400).json({ message: "schoolId, teacherId, and jobId are required." });
  }
  try {
    const data = await aiService.getMatchScoreForApplication(teacherId, schoolId, jobId);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(400).json({ status: "fail", message: err.message });
  }
};

// GET /ai-matching/recommended-jobs — teacher's recommended jobs (logged-in teacher only)
exports.getRecommendedJobs = async (req, res) => {
  try {
    const data = await aiService.getRecommendedJobsForTeacher(
      req.user.Teacher_ID, req.query.limit
    );
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /ai-matching/bulk-scores — match score for EVERY active job, for the
// logged-in teacher. Used by the public Browse Jobs page to overlay match %
// onto the regular job listing without duplicating its filters/pagination.
exports.getBulkScores = async (req, res) => {
  try {
    const data = await aiService.getBulkScoresForTeacher(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
// ── New endpoints for Enhancement 1, 2, 3 ────────────────────────────────────

// GET /ai-matching/job/:schoolId/:jobId/matches-detailed
// Returns full personality + stage breakdown per teacher (admin use)
exports.getMatchesForJobDetailed = async (req, res) => {
  try {
    const { schoolId, jobId } = req.params;
    const data = await aiService.getMatchesForJobDetailed(schoolId, jobId, req.query.limit);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};
