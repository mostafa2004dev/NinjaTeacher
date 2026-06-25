const express = require("express");
const router  = express.Router();
const ctrl    = require("./appliedJobs.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);

// Teacher: view & manage own applications
router.get   ("/",       ctrl.getMyAppliedJobs);
router.post  ("/",       ctrl.applyToJob);
router.delete("/:jobId", ctrl.cancelApplication);

// NOTE: Application status updates (accept/reject/interview) are handled by
// the school portal at PATCH /school/jobs/:jobId/applicants/:teacherId/status
// The updateApplicationStatus controller exists for potential future use.

module.exports = router;