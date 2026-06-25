const schoolService = require("./school.service");

exports.getDashboard = async (req, res) => {
  try {
    const data = await schoolService.getSchoolDashboard(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const data = await schoolService.getSchoolJobs(req.user.Teacher_ID, req.query);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.createJob = async (req, res) => {
  const { Title } = req.body;
  if (!Title) {
    return res.status(400).json({ status: "fail", message: "Job title is required." });
  }
  try {
    const job = await schoolService.createJob(req.user.Teacher_ID, req.body);
    return res.status(201).json({ status: "success", data: job });
  } catch (err) {
    const isLimitError = err.message.includes("limit") || err.message.includes("Upgrade");
    const code = isLimitError ? 400 : 500;
    return res.status(code).json({ status: isLimitError ? "fail" : "error", message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await schoolService.updateJob(
      req.user.Teacher_ID, req.params.jobId, req.body
    );
    return res.status(200).json({ status: "success", data: job });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await schoolService.deleteJob(req.user.Teacher_ID, req.params.jobId);
    return res.status(200).json({ status: "success", message: "Job deleted." });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.getJobApplicants = async (req, res) => {
  try {
    const data = await schoolService.getJobApplicants(
      req.user.Teacher_ID, req.params.jobId, req.query
    );
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.getAllApplicants = async (req, res) => {
  try {
    const data = await schoolService.getAllApplicants(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.updateApplicantStatus = async (req, res) => {
  const { status, message } = req.body;
  const allowed = ["pending", "shortlisted", "interview", "accepted", "rejected"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({
      status: "fail",
      message: `status must be one of: ${allowed.join(", ")}`,
    });
  }
  try {
    const data = await schoolService.updateApplicantStatus(
      req.user.Teacher_ID, req.params.jobId, req.params.teacherId, status, message
    );
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};