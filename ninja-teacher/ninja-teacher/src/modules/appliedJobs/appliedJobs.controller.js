const appliedJobsService = require("./appliedJobs.service");

// GET /applied-jobs
async function getMyAppliedJobs(req, res) {
  try {
    const data = await appliedJobsService.getMyAppliedJobs(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    console.error("🔴 GET APPLIED JOBS ERROR:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// POST /applied-jobs
// Body: { Job_ID, School_ID } or { job_id, school_id }
async function applyToJob(req, res) {
  try {
    const jobId    = req.body.Job_ID    ?? req.body.job_id;
    const schoolId = req.body.School_ID ?? req.body.school_id;

    console.log("📩 Apply request body:", req.body);
    console.log("👤 Teacher ID:", req.user.Teacher_ID);
    console.log("🏫 School ID:", schoolId, "| 💼 Job ID:", jobId);

    if (!jobId) {
      return res.status(400).json({ status: "fail", message: "Job_ID is required." });
    }

    const application = await appliedJobsService.applyToJob(
      req.user.Teacher_ID,
      schoolId,
      jobId
    );

    return res.status(201).json({
      status: "success",
      message: "Application submitted successfully.",
      data: application,
    });
  } catch (err) {
    console.error("🔴 APPLY ERROR FULL:", err);
    console.error("🔴 APPLY ERROR MESSAGE:", err.message);
    console.error("🔴 APPLY ERROR STACK:", err.stack);

    if (err.message === "Already applied to this job") {
      return res.status(409).json({ status: "fail", message: err.message });
    }
    if (err.message === "Job not found." || err.message.includes("School_ID is required")) {
      return res.status(400).json({ status: "fail", message: err.message });
    }
    if (err.message.includes("no longer accepting")) {
      return res.status(400).json({ status: "fail", message: err.message });
    }
    if (err.message.includes("limit")) {
      return res.status(403).json({ status: "fail", message: err.message });
    }
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// DELETE /applied-jobs/:jobId?school_id=2
async function cancelApplication(req, res) {
  try {
    const schoolId = req.query.school_id ?? req.query.School_ID ?? null;
    await appliedJobsService.cancelApplication(
      req.user.Teacher_ID,
      req.params.jobId,
      schoolId
    );
    return res.status(200).json({ status: "success", message: "Application cancelled." });
  } catch (err) {
    console.error("🔴 CANCEL ERROR:", err);
    if (err.message === "Application not found") {
      return res.status(404).json({ status: "fail", message: err.message });
    }
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// PATCH /applied-jobs/:jobId/applicants/:teacherId/status
async function updateApplicationStatus(req, res) {
  try {
    const { jobId, teacherId } = req.params;
    const { status }           = req.body;
    const schoolId = req.body.School_ID ?? req.body.school_id ?? req.query.school_id ?? null;

    const allowed = ["pending", "interview", "accepted", "rejected"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
    }

    const result = await appliedJobsService.updateApplicationStatus(
      teacherId,
      jobId,
      status,
      schoolId
    );

    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    console.error("🔴 UPDATE STATUS ERROR:", err);
    if (err.message === "Application not found") {
      return res.status(404).json({ status: "fail", message: err.message });
    }
    return res.status(500).json({ status: "error", message: err.message });
  }
}

module.exports = {
  getMyAppliedJobs,
  applyToJob,
  cancelApplication,
  updateApplicationStatus,
};