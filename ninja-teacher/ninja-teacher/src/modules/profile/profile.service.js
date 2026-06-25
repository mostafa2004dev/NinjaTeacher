const { WorkExperience, Education, Certification } = require("./profile.model");
const Teacher = require("../users/users.model");

const SAFE_TEACHER_ATTRS = { exclude: ["Password", "Reset_Token", "Reset_Token_Expiry"] };

function formatTeacherProfile(teacher) {
  const json = teacher.toJSON ? teacher.toJSON() : { ...teacher };
  return {
    ...json,
    gender: json.Gender ?? null,
    cv: json.CV_File ?? null,
    cv_url: json.CV_File ?? null,
  };
}

async function calculateCompletion(teacherId) {
  const teacher = await Teacher.findByPk(teacherId);
  if (!teacher) return 0;

  let score = 0;
  const total = 12;

  if (teacher.Name)               score++;
  if (teacher.Email)              score++;
  if (teacher.Phone)              score++;
  if (teacher.Gender)             score++;
  if (teacher.Image)              score++;
  if (teacher.CV_File)            score++;
  if (teacher.Bio)                score++;
  if (teacher.Specialization)     score++;
  if (teacher.Years_of_Experience >= 0) score++;

  const [expCount, eduCount, certCount] = await Promise.all([
    WorkExperience.count({ where: { teacher_id: teacherId } }),
    Education.count({ where: { teacher_id: teacherId } }),
    Certification.count({ where: { teacher_id: teacherId } }),
  ]);

  if (expCount > 0)  score++;
  if (eduCount > 0)  score++;
  if (certCount > 0) score++;

  const pct = Math.round((score / total) * 100);
  await Teacher.update({ Profile_Completion: pct }, { where: { Teacher_ID: teacherId } });
  return pct;
}

async function updateBasicInfo(teacherId, data) {
  const allowed = [
    "Name", "Phone", "Date_of_Birth", "Gender", "Nationality",
    "Location", "Governorate", "Bio", "Specialization", "Teacher_Stage", "Years_of_Experience",
    "Qualifications", "Job_Type_Preference", "Expected_Salary", "Is_Available",
    "LinkedIn_URL", "Website_URL", "CV_File", "Image",
  ];
  const updates = {};
  for (const field of allowed) {
    if (data[field] !== undefined) updates[field] = data[field];
  }
  if (data.gender !== undefined && updates.Gender === undefined) {
    const g = String(data.gender).trim().toLowerCase();
    if (["male", "female", "other"].includes(g)) updates.Gender = g;
  }
  if ((data.cv !== undefined || data.cv_url !== undefined) && updates.CV_File === undefined) {
    updates.CV_File = data.cv_url ?? data.cv ?? null;
  }
  await Teacher.update(updates, { where: { Teacher_ID: teacherId } });
  const completion = await calculateCompletion(teacherId);
  const teacher = await Teacher.findByPk(teacherId, { attributes: SAFE_TEACHER_ATTRS });
  const score = teacher.Big5_Score ?? null;
  return {
    ...formatTeacherProfile(teacher),
    profile_completion: completion,
    evaluationScore: score,
    evaluationLevel: score != null ? (score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Below Average') : null,
  };
}

async function addWorkExperience(teacherId, data) {
  const exp = await WorkExperience.create({ ...data, teacher_id: teacherId });
  await calculateCompletion(teacherId);
  return exp;
}

async function updateWorkExperience(id, teacherId, data) {
  const exp = await WorkExperience.findOne({ where: { id, teacher_id: teacherId } });
  if (!exp) throw new Error("Work experience not found.");
  const allowed = ["job_title","school_name","location","subject","start_date","end_date","is_current","description"];
  for (const f of allowed) { if (data[f] !== undefined) exp[f] = data[f]; }
  await exp.save();
  return exp;
}

async function deleteWorkExperience(id, teacherId) {
  const exp = await WorkExperience.findOne({ where: { id, teacher_id: teacherId } });
  if (!exp) throw new Error("Work experience not found.");
  await exp.destroy();
  await calculateCompletion(teacherId);
  return true;
}

async function getWorkExperience(teacherId) {
  return await WorkExperience.findAll({
    where: { teacher_id: teacherId },
    order: [["start_date", "DESC"]],
  });
}

async function addEducation(teacherId, data) {
  const edu = await Education.create({ ...data, teacher_id: teacherId });
  await calculateCompletion(teacherId);
  return edu;
}

async function updateEducation(id, teacherId, data) {
  const edu = await Education.findOne({ where: { id, teacher_id: teacherId } });
  if (!edu) throw new Error("Education entry not found.");
  const allowed = ["degree","institution","field","start_year","end_year","grade","description"];
  for (const f of allowed) { if (data[f] !== undefined) edu[f] = data[f]; }
  await edu.save();
  return edu;
}

async function deleteEducation(id, teacherId) {
  const edu = await Education.findOne({ where: { id, teacher_id: teacherId } });
  if (!edu) throw new Error("Education entry not found.");
  await edu.destroy();
  await calculateCompletion(teacherId);
  return true;
}

async function getEducation(teacherId) {
  return await Education.findAll({
    where: { teacher_id: teacherId },
    order: [["end_year", "DESC"]],
  });
}

async function addCertification(teacherId, data) {
  const cert = await Certification.create({ ...data, teacher_id: teacherId });
  await calculateCompletion(teacherId);
  return cert;
}

async function updateCertification(id, teacherId, data) {
  const cert = await Certification.findOne({ where: { id, teacher_id: teacherId } });
  if (!cert) throw new Error("Certification not found.");
  const allowed = ["title","issuing_org","issue_date","expiry_date","credential_id","credential_url","description"];
  for (const f of allowed) { if (data[f] !== undefined) cert[f] = data[f]; }
  await cert.save();
  return cert;
}

async function deleteCertification(id, teacherId) {
  const cert = await Certification.findOne({ where: { id, teacher_id: teacherId } });
  if (!cert) throw new Error("Certification not found.");
  await cert.destroy();
  await calculateCompletion(teacherId);
  return true;
}

async function getCertifications(teacherId) {
  return await Certification.findAll({
    where: { teacher_id: teacherId },
    order: [["issue_date", "DESC"]],
  });
}

async function getFullProfile(teacherId) {
  const [teacher, experience, education, certifications] = await Promise.all([
    Teacher.findByPk(teacherId, { attributes: SAFE_TEACHER_ATTRS }),
    getWorkExperience(teacherId),
    getEducation(teacherId),
    getCertifications(teacherId),
  ]);
  if (!teacher) throw new Error("Teacher not found.");

  const completion = teacher.Profile_Completion ?? await calculateCompletion(teacherId);

  const score = teacher.Big5_Score ?? null;
  return {
    ...formatTeacherProfile(teacher),
    profile_completion: completion,
    evaluationScore: score,
    evaluationLevel: score != null ? (score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Below Average') : null,
    experience,
    education,
    certifications,
  };
}

module.exports = {
  formatTeacherProfile,
  calculateCompletion,
  updateBasicInfo,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  getWorkExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  getEducation,
  addCertification,
  updateCertification,
  deleteCertification,
  getCertifications,
  getFullProfile,
};