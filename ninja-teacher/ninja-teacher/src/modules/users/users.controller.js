const usersService = require("./users.service");

async function getMyProfile(req, res) {
  try {
    const user = await usersService.getMyProfile(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data: user });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

async function getUserById(req, res) {
  try {
    const user = await usersService.getUserById(req.params.id, req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data: user });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
}

async function updateProfilePhoto(req, res) {
  if (!req.file) {
    return res.status(400).json({ status: "fail", message: "Please upload an image file." });
  }
  try {
    const imagePath   = `/uploads/profiles/${req.file.filename}`;
    const updatedUser = await usersService.updateProfileImage(req.user.Teacher_ID, imagePath);
    return res.status(200).json({
      status:  "success",
      message: "Profile photo updated.",
      data:    updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

async function updateAccountSettings(req, res) {
  try {
    const user = await usersService.updateAccountSettings(req.user.Teacher_ID, req.body);
    return res.status(200).json({ status: "success", data: user });
  } catch (err) {
    const code = err.message.includes("No valid") ? 400 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ status: "fail", message: "All fields are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ status: "fail", message: "New password must be at least 8 characters." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: "fail", message: "Passwords do not match." });
    }

    await usersService.changePassword(req.user.Teacher_ID, { currentPassword, newPassword });

    return res.status(200).json({ status: "success", message: "Password changed successfully." });
  } catch (err) {
    const code = err.message.includes("incorrect") ? 401 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
}

module.exports = {
  getMyProfile,
  getUserById,
  updateProfilePhoto,
  updateAccountSettings,
  changePassword,
};