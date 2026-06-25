const dashboardService = require("./dashboard.service");

// GET /dashboard/stats — full teacher dashboard payload
async function getTeacherStats(req, res) {
  try {
    const data = await dashboardService.getTeacherStats(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// POST /dashboard/saved — body: { School_ID, Job_ID } or { school_id, job_id }
async function saveJob(req, res) {
  try {
    const schoolId = req.body.School_ID ?? req.body.school_id;
    const jobId = req.body.Job_ID ?? req.body.job_id;

    if (!schoolId || !jobId) {
      return res.status(400).json({
        status: "fail",
        message: "School_ID and Job_ID are required.",
      });
    }

    const item = await dashboardService.saveJob(
      req.user.Teacher_ID,
      schoolId,
      jobId
    );

    return res.status(201).json({
      status: "success",
      message: "Job saved.",
      data: item,
    });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
}

// DELETE /dashboard/saved/:schoolId/:jobId
async function unsaveJob(req, res) {
  try {
    await dashboardService.unsaveJob(
      req.user.Teacher_ID,
      req.params.schoolId,
      req.params.jobId
    );
    return res.status(200).json({ status: "success", message: "Job removed from saved." });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
}

// GET /dashboard/saved — list saved jobs for the logged-in teacher
async function getSavedJobs(req, res) {
  try {
    const data = await dashboardService.getSavedJobsForTeacher(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

module.exports = { getTeacherStats, saveJob, unsaveJob, getSavedJobs };
