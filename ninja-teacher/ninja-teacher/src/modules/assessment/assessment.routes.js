const express = require("express");
const router  = express.Router();
const ctrl    = require("./assessment.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);

router.post("/",        ctrl.submitAssessment);
router.get("/",         ctrl.getMyAssessments);
router.get("/latest",   ctrl.getLatestAssessment);
router.get("/:id",      ctrl.getAssessmentById);

module.exports = router;
