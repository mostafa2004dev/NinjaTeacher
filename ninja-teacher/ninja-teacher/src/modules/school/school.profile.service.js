const Teacher = require("../users/users.model");

function formatSchoolProfile(school) {
  const json = school.toJSON ? school.toJSON() : { ...school };
  return {
    id:                 json.Teacher_ID,
    name:               json.Name,
    email:              json.Email,
    phone:              json.Phone,
    image:              json.Image,
    bio:                json.Bio,
    location:           json.Location,
    governorate:        json.Governorate,
    website_url:        json.Website_URL,
    linkedin_url:       json.LinkedIn_URL,
    school_name:        json.School_Name,
    school_type:        json.School_Type,
    school_size:        json.School_Size,
    founded_year:       json.Founded_Year ?? null,
    average_rating:     json.Average_Rating,
    total_reviews:      json.Total_Reviews,
    profile_completion: json.Profile_Completion,
    role:               json.Role,
    core_values:        json.Core_Values        ?? "",
    academic_programs:  json.Academic_Programs  ?? "",
    achievements:       json.Achievements       ?? "",
  };
}

async function getSchoolProfile(schoolId) {
  const school = await Teacher.findOne({
    where: { Teacher_ID: schoolId, Role: "school" },
    // ✅ بنجيب الـ columns صريح بدل exclude
    attributes: [
      "Teacher_ID", "Name", "Email", "Phone", "Image", "Bio",
      "Location", "Governorate", "Website_URL", "LinkedIn_URL",
      "School_Name", "School_Type", "School_Size", "Founded_Year",
      "Average_Rating", "Total_Reviews", "Profile_Completion", "Role",
      "Core_Values", "Academic_Programs", "Achievements",
    ],
  });
  if (!school) throw new Error("School not found.");
  return formatSchoolProfile(school);
}

async function updateSchoolProfile(schoolId, data) {
  const allowed = [
    "Name", "Phone", "Bio", "Location", "Governorate",
    "Website_URL", "LinkedIn_URL",
    "School_Name", "School_Type", "School_Size",
    "Core_Values", "Academic_Programs", "Achievements",
  ];

  const updates = {};
  for (const field of allowed) {
    if (data[field] !== undefined) updates[field] = data[field];
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid fields provided.");
  }

  await Teacher.update(updates, {
    where: { Teacher_ID: schoolId, Role: "school" },
  });

  return await getSchoolProfile(schoolId);
}

module.exports = { getSchoolProfile, updateSchoolProfile };