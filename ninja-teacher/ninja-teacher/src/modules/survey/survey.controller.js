const surveyService = require("./survey.service");

// POST /survey/submit
async function submitSurvey(req, res) {
  if (req.user?.Role !== "teacher") {
    return res.status(403).json({ status: "fail", message: "Only teacher accounts can submit surveys." });
  }

  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({
      status: "fail",
      message: "Answers are required.",
      errors: { answers: "Please provide an array of answers." },
    });
  }

  if (answers.length !== 14) {
    return res.status(400).json({
      status: "fail",
      message: "All 14 questions must be answered.",
      errors: { answers: `Expected 14 answers, got ${answers.length}.` },
    });
  }

  try {
    const result = await surveyService.submitSurvey(req.user.Teacher_ID, answers);
    return res.status(200).json({
      status: "success",
      message: "Survey submitted successfully.",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to submit survey.",
      error: err.message,
    });
  }
}

// GET /survey/answers
async function getSurveyAnswers(req, res) {
  try {
    const result = await surveyService.getSurveyAnswers(req.user.Teacher_ID);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve survey answers.",
      error: err.message,
    });
  }
}

module.exports = { submitSurvey, getSurveyAnswers };
