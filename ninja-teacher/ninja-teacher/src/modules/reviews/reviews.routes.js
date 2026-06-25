const express = require("express");
const router  = express.Router();
const ctrl    = require("./reviews.controller");
const { protect } = require("../../middlewares/auth.middleware");

// Public
router.get("/teachers/:teacherId",  ctrl.getTeacherReviews);
router.get("/top-teachers",         ctrl.getTopRatedTeachers);
router.get("/testimonials",         ctrl.getTestimonials);

// Protected — schools post reviews
router.post("/", protect, ctrl.addReview);

module.exports = router;
