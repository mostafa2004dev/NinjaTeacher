const { Op } = require("sequelize");
const AppliedJob = require("./appliedJobs.model");
const Post = require("../jobPosts/jobPosts.model");
const Teacher = require("../users/users.model");
const notifService = require("../notifications/notifications.service");
const { checkApplicationLimit } = require("../subscriptions/subscription.limits");

const SCHOOL_ATTRS = [
  "Teacher_ID", "Name", "Email", "Phone", "Image", "Location",
  "School_Name", "School_Type", "School_Size", "Average_Rating", "Role",
];

const POST_INCLUDE = [
  {
    model: Teacher,
    as: "School",
    attributes: SCHOOL_ATTRS,
    required: false,
  },
];

function parseJsonField(value, fallback = []) {
  if (value == null) return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function formatSchool(teacher) {
  if (!teacher) return null;
  const t = teacher.toJSON ? teacher.toJSON() : teacher;
  return {
    id: t.Teacher_ID,
    teacher_id: t.Teacher_ID,
    name: t.School_Name || t.Name,
    school_name: t.School_Name || t.Name,
    email: t.Email ?? null,
    phone: t.Phone ?? null,
    image: t.Image ?? null,
    location: t.Location ?? null,
    school_type: t.School_Type ?? null,
    school_size: t.School_Size ?? null,
    rating: t.Average_Rating ?? 0,
    role: t.Role ?? "school",
  };
}

function formatJob(post) {
  if (!post) return null;
  const raw = post.toJSON ? post.toJSON() : post;
  const schoolData = raw.School || null;
  return {
    School_ID: raw.School_ID,
    Job_ID: raw.Job_ID,
    school_id: raw.School_ID,
    job_id: raw.Job_ID,
    id: `${raw.School_ID}-${raw.Job_ID}`,
    Title: raw.Title,
    title: raw.Title,
    Location: raw.Location,
    location: raw.Location,
    Description: raw.Description,
    description: raw.Description,
    Content: raw.Content,
    content: raw.Content,
    Date: raw.Date,
    date: raw.Date,
    Status: raw.Status,
    status: raw.Status,
    Job_Type: raw.Job_Type,
    job_type: raw.Job_Type,
    Specialization: raw.Specialization,
    specialization: raw.Specialization,
    Required_Experience: raw.Required_Experience,
    required_experience: raw.Required_Experience,
    Required_Qualifications: raw.Required_Qualifications,
    required_qualifications: raw.Required_Qualifications,
    Start_Date: raw.Start_Date,
    start_date: raw.Start_Date,
    Deadline: raw.Deadline,
    deadline: raw.Deadline,
    Salary_Range: raw.Salary_Range,
    salary_range: raw.Salary_Range,
    Subjects: parseJsonField(raw.Subjects),
    subjects: parseJsonField(raw.Subjects),
    Responsibilities: parseJsonField(raw.Responsibilities),
    responsibilities: parseJsonField(raw.Responsibilities),
    Requirements: parseJsonField(raw.Requirements),
    requirements: parseJsonField(raw.Requirements),
    Benefits: parseJsonField(raw.Benefits),
    benefits: parseJsonField(raw.Benefits),
    Teaching_Style: raw.Teaching_Style,
    teaching_style: raw.Teaching_Style,
    Classroom_Energy: raw.Classroom_Energy,
    classroom_energy: raw.Classroom_Energy,
    Leadership_Style: raw.Leadership_Style,
    leadership_style: raw.Leadership_Style,
    Communication_Style: raw.Communication_Style,
    communication_style: raw.Communication_Style,
    Problem_Solving: raw.Problem_Solving,
    problem_solving: raw.Problem_Solving,
    Applicants_Count: raw.Applicants_Count,
    applicants_count: raw.Applicants_Count,
    School_Rating: raw.School_Rating,
    school_rating: raw.School_Rating,
    school: formatSchool(schoolData),
  };
}

function formatApplication(app, post = null) {
  const raw = app.toJSON ? app.toJSON() : app;
  const job = post || raw.Post || null;
  const formattedJob = formatJob(job);
  return {
    Teacher_ID: raw.Teacher_ID,
    School_ID: raw.School_ID,
    Job_ID: raw.Job_ID,
    teacher_id: raw.Teacher_ID,
    school_id: raw.School_ID,
    job_id: raw.Job_ID,
    Apply_Date: raw.Apply_Date,
    apply_date: raw.Apply_Date,
    Status: raw.Status,
    status: raw.Status,
    Big5_Score: raw.Big5_Score,
    big5_score: raw.Big5_Score,
    job: formattedJob,
    Post: formattedJob,
  };
}

function postLookupKey(schoolId, jobId) {
  return schoolId != null ? `${schoolId}-${jobId}` : `job-${jobId}`;
}

async function fetchPostsForApplications(applications) {
  if (!applications.length) return new Map();

  const withSchool = applications.filter((a) => a.School_ID != null);
  const legacyOnly = applications.filter((a) => a.School_ID == null);
  const conditions = [];

  if (withSchool.length) {
    conditions.push({
      [Op.or]: withSchool.map((a) => ({ School_ID: a.School_ID, Job_ID: a.Job_ID })),
    });
  }
  if (legacyOnly.length) {
    conditions.push({
      Job_ID: { [Op.in]: [...new Set(legacyOnly.map((a) => a.Job_ID))] },
    });
  }
  if (!conditions.length) return new Map();

  const posts = await Post.findAll({
    where: conditions.length === 1 ? conditions[0] : { [Op.or]: conditions },
    include: POST_INCLUDE,
  });

  const map = new Map();
  for (const post of posts) {
    map.set(postLookupKey(post.School_ID, post.Job_ID), post);
    if (!map.has(postLookupKey(null, post.Job_ID))) {
      map.set(postLookupKey(null, post.Job_ID), post);
    }
  }
  return map;
}

function resolvePostFromMap(app, postMap) {
  if (app.School_ID != null) {
    return postMap.get(postLookupKey(app.School_ID, app.Job_ID)) || null;
  }
  return postMap.get(postLookupKey(null, app.Job_ID)) || null;
}

async function resolveSchoolAndJobIds(schoolId, jobId) {
  const parsedJobId = parseInt(jobId, 10);
  let parsedSchoolId = schoolId != null ? parseInt(schoolId, 10) : null;

  if (!parsedJobId || Number.isNaN(parsedJobId)) {
    throw new Error("Valid Job_ID is required.");
  }

  if (!parsedSchoolId || Number.isNaN(parsedSchoolId)) {
    const matches = await Post.findAll({
      where: {
        Job_ID: parsedJobId,
        [Op.or]: [{ Status: "active" }, { Status: { [Op.is]: null } }],
      },
      attributes: ["School_ID", "Job_ID"],
    });

    if (matches.length === 1) {
      parsedSchoolId = matches[0].School_ID;
    } else if (matches.length > 1) {
      throw new Error("School_ID is required when multiple schools share this Job_ID.");
    } else {
      throw new Error("Job not found.");
    }
  }

  const post = await Post.findOne({
    where: { School_ID: parsedSchoolId, Job_ID: parsedJobId },
    include: POST_INCLUDE,
  });

  if (!post) throw new Error("Job not found.");

  return { schoolId: parsedSchoolId, jobId: parsedJobId, post };
}

async function findApplication(teacherId, schoolId, jobId) {
  const where = { Teacher_ID: teacherId, Job_ID: jobId };
  if (schoolId != null) where.School_ID = schoolId;

  let application = await AppliedJob.findOne({ where });

  if (!application && schoolId != null) {
    application = await AppliedJob.findOne({
      where: { Teacher_ID: teacherId, Job_ID: jobId, School_ID: { [Op.is]: null } },
    });
  }
  return application;
}

// ── getMyAppliedJobs ──────────────────────────────────────────────────────────
async function getMyAppliedJobs(teacherId) {
  const applications = await AppliedJob.findAll({
    where: { Teacher_ID: teacherId },
    order: [["Apply_Date", "DESC"]],
  });
  if (!applications.length) return [];
  const postMap = await fetchPostsForApplications(applications);
  return applications.map((app) =>
    formatApplication(app, resolvePostFromMap(app, postMap))
  );
}

// ── applyToJob ────────────────────────────────────────────────────────────────
async function applyToJob(teacherId, schoolId, jobId) {
  const { schoolId: resolvedSchoolId, jobId: resolvedJobId, post } =
    await resolveSchoolAndJobIds(schoolId, jobId);

  await checkApplicationLimit(teacherId);

  const existing = await findApplication(teacherId, resolvedSchoolId, resolvedJobId);
  if (existing) throw new Error("Already applied to this job");

  if (post.Status === "closed") {
    throw new Error("This job is no longer accepting applications.");
  }

  const teacherRecord = await Teacher.findByPk(teacherId, { attributes: ["Big5_Score"] });

  const application = await AppliedJob.create({
    Teacher_ID: teacherId,
    School_ID:  resolvedSchoolId,
    Job_ID:     resolvedJobId,
    Apply_Date: new Date(),
    Status:     "pending",
    Big5_Score: teacherRecord?.Big5_Score ?? null,
  });

  await Post.increment("Applicants_Count", {
    where: { School_ID: resolvedSchoolId, Job_ID: resolvedJobId },
  });

  // إشعار المعلم نفسه: تم تقديم الطلب بنجاح
  await notifService.createNotification(
    teacherId,
    "application_received",
    "Application Submitted",
    `Your application for "${post.Title}" has been submitted successfully.`,
    resolvedJobId
  );

  // ✅ إشعار المدرسة: فيه معلم جديد قدّم على وظيفتها
  // (ده كان ناقص بالكامل — السبب الجذري لمشكلة "School Notifications")
  await notifService.createNotification(
    resolvedSchoolId,
    "new_application",
    "New Job Application",
    `A teacher has applied for your job "${post.Title}".`,
    resolvedJobId,
    resolvedSchoolId
  );

  return formatApplication(application, post);
}

// ── cancelApplication ─────────────────────────────────────────────────────────
async function cancelApplication(teacherId, jobId, schoolId = null) {
  const parsedJobId    = parseInt(jobId, 10);
  const parsedSchoolId = schoolId != null ? parseInt(schoolId, 10) : null;

  const application = await findApplication(teacherId, parsedSchoolId, parsedJobId);
  if (!application) throw new Error("Application not found");

  const decrementSchoolId = application.School_ID ?? parsedSchoolId;
  await application.destroy();

  if (decrementSchoolId != null) {
    await Post.decrement("Applicants_Count", {
      where: { School_ID: decrementSchoolId, Job_ID: parsedJobId },
    });
  }
  return true;
}

// ── updateApplicationStatus ───────────────────────────────────────────────────
async function updateApplicationStatus(teacherId, jobId, newStatus, schoolId = null) {
  const parsedJobId    = parseInt(jobId, 10);
  const parsedSchoolId = schoolId != null ? parseInt(schoolId, 10) : null;

  const application = await findApplication(teacherId, parsedSchoolId, parsedJobId);
  if (!application) throw new Error("Application not found");

  application.Status = newStatus;
  await application.save();

  const post = await Post.findOne({
    where: {
      Job_ID: parsedJobId,
      ...(application.School_ID != null ? { School_ID: application.School_ID } : {}),
    },
    include: POST_INCLUDE,
  });

  await notifService.createNotification(
    teacherId,
    "status_update",
    "Application Status Updated",
    `Your application${post ? ` for "${post.Title}"` : ""} has been updated to "${newStatus}".`,
    parsedJobId
  );

  return formatApplication(application, post);
}

module.exports = {
  getMyAppliedJobs,
  applyToJob,
  cancelApplication,
  updateApplicationStatus,
  formatApplication,
};