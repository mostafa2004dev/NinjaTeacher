const express = require("express");
const router = express.Router();
const { submitSurvey, getSurveyAnswers } = require("./survey.controller");
const { protect } = require("../../middlewares/auth.middleware");
// POST /survey/submit  — المدرس يبعت إجاباته
router.post("/submit", protect, submitSurvey);
router.get("/answers", protect, getSurveyAnswers);

module.exports = router;
