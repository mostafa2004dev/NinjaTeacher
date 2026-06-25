const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const ctrl    = require("./profile.controller");
const { protect } = require("../../middlewares/auth.middleware");

// Profile images go to uploads/profiles, CVs go to uploads/cvs, and the
// original extension is kept so the files can be opened/served correctly
// (the previous `dest: "uploads/"` config dropped extensions entirely).
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === "cv" ? "uploads/cvs" : "uploads/profiles";
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Used by PUT /basic: both files are optional, either/none/both may be sent.
const uploadBasicInfoFiles = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "cv", maxCount: 1 },
]);

// ── Public ────────────────────────────────────────────────────────────────
router.get("/public/:teacherId", ctrl.getPublicProfile);

// ── Protected ─────────────────────────────────────────────────────────────
router.use(protect);

// Complete profile in one shot
router.post("/complete-teacher-profile", upload.single("image"), ctrl.completeProfile);

// My full profile
router.get  ("/",      ctrl.getMyFullProfile);
router.put  ("/basic", uploadBasicInfoFiles, ctrl.updateBasicInfo);

// Work experience
router.get   ("/experience",     ctrl.getWorkExperience);
router.post  ("/experience",     ctrl.addWorkExperience);
router.put   ("/experience/:id", ctrl.updateWorkExperience);
router.delete("/experience/:id", ctrl.deleteWorkExperience);

// Education
router.get   ("/education",     ctrl.getEducation);
router.post  ("/education",     ctrl.addEducation);
router.put   ("/education/:id", ctrl.updateEducation);
router.delete("/education/:id", ctrl.deleteEducation);

// Certifications
router.get   ("/certifications",     ctrl.getCertifications);
router.post  ("/certifications",     ctrl.addCertification);
router.put   ("/certifications/:id", ctrl.updateCertification);
router.delete("/certifications/:id", ctrl.deleteCertification);

// Public by ID
router.get("/:teacherId", ctrl.getPublicProfile);

module.exports = router;