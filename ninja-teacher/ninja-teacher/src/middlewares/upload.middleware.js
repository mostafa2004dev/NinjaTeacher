const multer = require("multer");
const path = require("path");
const fs = require("fs");

const profilesDir = path.join(__dirname, "../../uploads/profiles");
const cvsDir = path.join(__dirname, "../../uploads/cvs");

[profilesDir, cvsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const PROFILE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const CV_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const CV_EXTENSIONS = [".pdf", ".doc", ".docx"];

function profileFileFilter(req, file, cb) {
  if (PROFILE_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"), false);
  }
}

function cvFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (CV_MIMES.includes(file.mimetype) || CV_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only CV files are allowed (pdf, doc, docx)"), false);
  }
}

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profilesDir),
  filename: (req, file, cb) => {
    const uniqueName = `profileImage-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, cvsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
    const uniqueName = `cv-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Registration: accepts cv / cvFile / CV field names (first match wins in controller)
const registrationUpload = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: "cv", maxCount: 1 },
  { name: "cvFile", maxCount: 1 },
  { name: "CV", maxCount: 1 },
]);

function getRegistrationCvFile(req) {
  const files = req.files || {};
  return files.cv?.[0] || files.cvFile?.[0] || files.CV?.[0] || null;
}

module.exports = { upload, registrationUpload, getRegistrationCvFile };
