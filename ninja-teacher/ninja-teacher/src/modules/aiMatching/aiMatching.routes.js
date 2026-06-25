// aiMatching.routes.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("./aiMatching.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);

// Rank teachers for a job (school view)
router.get("/job/:schoolId/:jobId/matches", ctrl.getMatchesForJob);

// Enhancement: detailed breakdown with personality + stage scores per teacher (admin/school)
router.get("/job/:schoolId/:jobId/matches-detailed", ctrl.getMatchesForJobDetailed);

// Match score for a single teacher↔job pair
router.get("/score/:schoolId/:teacherId/:jobId", ctrl.getMatchScore);

// Recommended jobs for the logged-in teacher (relevance-filtered + blended score)
router.get("/recommended-jobs", ctrl.getRecommendedJobs);

// Match scores for ALL active jobs — used by Browse Jobs page to overlay match %
router.get("/bulk-scores", ctrl.getBulkScores);

module.exports = router;
