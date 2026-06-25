const express = require("express");
const router  = express.Router();
const ctrl        = require("./school.controller");
const profileCtrl = require("./school.profile.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);

// ── Profile ───────────────────────────────────────────────────────────────
router.get("/profile", profileCtrl.getSchoolProfile);
router.put("/profile", profileCtrl.updateSchoolProfile);

// ── Dashboard ─────────────────────────────────────────────────────────────
router.get("/dashboard", ctrl.getDashboard);

// ── Applicants (bulk) ─────────────────────────────────────────────────────
router.get   ("/applicants",                                ctrl.getAllApplicants);

// ── Jobs ──────────────────────────────────────────────────────────────────
router.get   ("/jobs",                                      ctrl.getMyJobs);
router.post  ("/jobs",                                      ctrl.createJob);
router.put   ("/jobs/:jobId",                               ctrl.updateJob);
router.delete("/jobs/:jobId",                               ctrl.deleteJob);
router.get   ("/jobs/:jobId/applicants",                    ctrl.getJobApplicants);
router.patch ("/jobs/:jobId/applicants/:teacherId/status",  ctrl.updateApplicantStatus);

module.exports = router;
