const bcrypt = require("bcryptjs");
const Teacher = require("./users.model");
const notifSvc = require("../notifications/notifications.service");

async function getMyProfile(userId) {
  const user = await Teacher.findByPk(userId, {
    attributes: { exclude: ["Password", "Reset_Token", "Reset_Token_Expiry"] },
  });
  if (!user) throw new Error("User not found.");
  return user;
}

async function getUserById(userId, viewerId) {
  const user = await Teacher.findByPk(userId, {
    attributes: { exclude: ["Password", "Reset_Token", "Reset_Token_Expiry"] },
  });
  if (!user) throw new Error("User not found.");

  if (viewerId && parseInt(viewerId) !== parseInt(userId)) {
    await notifSvc.createNotification(
      userId,
      "profile_view",
      "Profile View",
      "Someone viewed your profile.",
      null
    );
  }
  return user;
}

async function updateProfileImage(userId, imagePath) {
  const user = await Teacher.findByPk(userId);
  if (!user) throw new Error("User not found.");
  user.Image = imagePath;
  await user.save();
  return {
    id: user.Teacher_ID,
    name: user.Name,
    email: user.Email,
    role: user.Role,
    profileImage: user.Image,
  };
}

async function updateAccountSettings(userId, data) {
  const allowed = [
    "Name", "Phone", "Date_of_Birth", "Gender", "Nationality",
    "Location", "Bio", "Specialization", "Teacher_Stage", "Years_of_Experience",
    "Job_Type_Preference", "Expected_Salary", "Is_Available",
    "LinkedIn_URL", "Website_URL",
    "School_Name", "School_Type", "School_Size",
  ];
  const updates = {};
  for (const field of allowed) {
    if (data[field] !== undefined) updates[field] = data[field];
  }
  if (Object.keys(updates).length === 0) {
    throw new Error("No valid fields provided.");
  }
  await Teacher.update(updates, { where: { Teacher_ID: userId } });
  const user = await Teacher.findByPk(userId, {
    attributes: { exclude: ["Password", "Reset_Token", "Reset_Token_Expiry"] },
  });
  return user;
}

async function changePassword(userId, { currentPassword, newPassword }) {
  // جيب اليوزر مع الباسورد
  const user = await Teacher.findByPk(userId);
  if (!user) throw new Error("User not found.");

  // تحقق من الباسورد الحالي
  const isMatch = await bcrypt.compare(currentPassword, user.Password);
  if (!isMatch) throw new Error("Current password is incorrect.");

  // تحقق إن الباسورد الجديد مختلف
  if (currentPassword === newPassword) {
    throw new Error("New password must be different from current password.");
  }

  // هاش وحفظ
  const hashed = await bcrypt.hash(newPassword, 12);
  user.Password = hashed;
  await user.save();
}

module.exports = {
  getMyProfile,
  getUserById,
  updateProfileImage,
  updateAccountSettings,
  changePassword,
};