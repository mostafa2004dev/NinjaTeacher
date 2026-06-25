const express = require("express");
const router  = express.Router();
const ctrl    = require("./home.controller");

router.get("/stats",                  ctrl.getStats);
router.get("/featured-jobs",          ctrl.getFeaturedJobs);
router.get("/top-teachers",           ctrl.getTopTeachers);
router.get("/testimonials",           ctrl.getTestimonials);
router.get("/analytics/personality",  ctrl.getPersonalityAnalytics);
router.post("/feedback",              ctrl.addFeedback);

module.exports = router;
