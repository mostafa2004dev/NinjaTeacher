const assessmentService = require("./assessment.service");

// POST /assessment
exports.submitAssessment = async (req, res) => {
  try {
    const result = await assessmentService.submitAssessment(
      req.user.Teacher_ID,
      req.body
    );
    return res.status(201).json({ status: "success", data: result });
  } catch (err) {
    const code = err.message.includes("Missing required") ? 400 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// GET /assessment
exports.getMyAssessments = async (req, res) => {
  try {
    const data = await assessmentService.getMyAssessments(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /assessment/latest
exports.getLatestAssessment = async (req, res) => {
  try {
    const data = await assessmentService.getLatestAssessment(req.user.Teacher_ID);
    if (!data) {
      return res.status(200).json({
        status: "success",
        data: null,
        message: "No completed assessment found. Take the assessment first.",
      });
    }
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /assessment/:id
exports.getAssessmentById = async (req, res) => {
  try {
    const data = await assessmentService.getAssessmentById(
      req.params.id,
      req.user.Teacher_ID
    );
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};
