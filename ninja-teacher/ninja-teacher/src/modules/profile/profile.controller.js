const profileService = require("./profile.service");

// GET /profile/
exports.getMyFullProfile = async (req, res) => {
  try {
    const data = await profileService.getFullProfile(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /profile/public/:teacherId
exports.getPublicProfile = async (req, res) => {
  try {
    const data = await profileService.getFullProfile(req.params.teacherId);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// PUT /profile/basic
exports.updateBasicInfo = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.files?.image?.[0]) updates.Image = req.files.image[0].path;
    if (req.files?.cv?.[0])    updates.CV_File = req.files.cv[0].path;

    const data = await profileService.updateBasicInfo(req.user.Teacher_ID, updates);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// POST /profile/complete-teacher-profile
exports.completeProfile = async (req, res) => {
  try {
    const teacherId = req.user.Teacher_ID;

    // Basic Info
    const basicData = {
      Specialization:      req.body.Specialization,
      Location:            req.body.Location,
      Phone:               req.body.Phone,
      Years_of_Experience: req.body.Years_of_Experience,
      Bio:                 req.body.Bio,
    };
    if (req.file) basicData.Image = req.file.path;

    await profileService.updateBasicInfo(teacherId, basicData);

    // Experience
    const expList = JSON.parse(req.body.experience || "[]");
    for (const exp of expList) {
      await profileService.addWorkExperience(teacherId, exp);
    }

    // Education
    const eduList = JSON.parse(req.body.education || "[]");
    for (const edu of eduList) {
      await profileService.addEducation(teacherId, edu);
    }

    // Certifications
    const certList = JSON.parse(req.body.certifications || "[]");
    for (const cert of certList) {
      await profileService.addCertification(teacherId, cert);
    }

    const fullProfile = await profileService.getFullProfile(teacherId);
    return res.status(200).json({ status: "success", data: fullProfile });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /profile/experience
exports.getWorkExperience = async (req, res) => {
  try {
    const data = await profileService.getWorkExperience(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// POST /profile/experience
exports.addWorkExperience = async (req, res) => {
  const { job_title, school_name, start_date } = req.body;
  if (!job_title || !school_name || !start_date) {
    return res.status(400).json({ status: "fail", message: "job_title, school_name, and start_date are required." });
  }
  try {
    const data = await profileService.addWorkExperience(req.user.Teacher_ID, req.body);
    return res.status(201).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// PUT /profile/experience/:id
exports.updateWorkExperience = async (req, res) => {
  try {
    const data = await profileService.updateWorkExperience(req.params.id, req.user.Teacher_ID, req.body);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// DELETE /profile/experience/:id
exports.deleteWorkExperience = async (req, res) => {
  try {
    await profileService.deleteWorkExperience(req.params.id, req.user.Teacher_ID);
    return res.status(200).json({ status: "success", message: "Work experience deleted." });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// GET /profile/education
exports.getEducation = async (req, res) => {
  try {
    const data = await profileService.getEducation(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// POST /profile/education
exports.addEducation = async (req, res) => {
  const { degree, institution } = req.body;
  if (!degree || !institution) {
    return res.status(400).json({ status: "fail", message: "degree and institution are required." });
  }
  try {
    const data = await profileService.addEducation(req.user.Teacher_ID, req.body);
    return res.status(201).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// PUT /profile/education/:id
exports.updateEducation = async (req, res) => {
  try {
    const data = await profileService.updateEducation(req.params.id, req.user.Teacher_ID, req.body);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// DELETE /profile/education/:id
exports.deleteEducation = async (req, res) => {
  try {
    await profileService.deleteEducation(req.params.id, req.user.Teacher_ID);
    return res.status(200).json({ status: "success", message: "Education entry deleted." });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// GET /profile/certifications
exports.getCertifications = async (req, res) => {
  try {
    const data = await profileService.getCertifications(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// POST /profile/certifications
exports.addCertification = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ status: "fail", message: "title is required." });
  }
  try {
    const data = await profileService.addCertification(req.user.Teacher_ID, req.body);
    return res.status(201).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// PUT /profile/certifications/:id
exports.updateCertification = async (req, res) => {
  try {
    const data = await profileService.updateCertification(req.params.id, req.user.Teacher_ID, req.body);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// DELETE /profile/certifications/:id
exports.deleteCertification = async (req, res) => {
  try {
    await profileService.deleteCertification(req.params.id, req.user.Teacher_ID);
    return res.status(200).json({ status: "success", message: "Certification deleted." });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};