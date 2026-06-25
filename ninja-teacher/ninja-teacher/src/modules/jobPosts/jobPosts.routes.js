const express = require("express");
const router = express.Router();
const jobController = require("./jobPosts.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.get("/", jobController.getAllPosts);
router.get("/my", protect, jobController.getMyPosts);
router.get("/:schoolId/:jobId", jobController.getPostById);

router.post("/", protect, jobController.createJobPost);
router.put("/:jobId", protect, jobController.updateJobPost);
router.delete("/:jobId", protect, jobController.deleteJobPost);

module.exports = router;