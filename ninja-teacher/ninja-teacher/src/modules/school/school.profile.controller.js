const schoolProfileService = require("./school.profile.service");

// GET /school/profile
exports.getSchoolProfile = async (req, res) => {
  try {
    const data = await schoolProfileService.getSchoolProfile(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// PUT /school/profile
exports.updateSchoolProfile = async (req, res) => {
  try {
    const data = await schoolProfileService.updateSchoolProfile(req.user.Teacher_ID, req.body);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    const code = err.message.includes("No valid") ? 400 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};
