const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);
router.get("/stats", dashboardController.getTeacherStats);

// Saved jobs (controller + service were already implemented; routes were missing)
router.post("/saved", dashboardController.saveJob);
router.delete("/saved/:schoolId/:jobId", dashboardController.unsaveJob);
// GET list of saved jobs (returns the same shape getTeacherStats already builds)
router.get("/saved", dashboardController.getSavedJobs);

module.exports = router;
