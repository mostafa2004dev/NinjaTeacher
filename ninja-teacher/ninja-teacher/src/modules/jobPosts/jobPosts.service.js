const { Op } = require("sequelize");
const { sequelize } = require("../../config/database");
const Post = require("./jobPosts.model");
const Teacher = require("../users/users.model");
const AppliedJob = require("../appliedJobs/appliedJobs.model");
const notifService = require("../notifications/notifications.service");
const { checkJobPostLimit } = require("../subscriptions/subscription.limits");

const SCHOOL_ATTRS = [
  "Teacher_ID", "Name", "Email", "Phone", "Image", "Location",
  "School_Name", "School_Type", "School_Size", "Average_Rating", "Role",
];

const JOB_INCLUDE = [
  {
    model: Teacher,
    as: "School",
    attributes: SCHOOL_ATTRS,
    required: false,
  },
];

function buildPublicStatusWhere(base = {}) {
  return {
    ...base,
    [Op.or]: [
      { Status: "active" },
      { Status: { [Op.is]: null } },
    ],
  };
}

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

function formatApplication(app) {
  if (!app) return null;
  const a = app.toJSON ? app.toJSON() : app;
  return {
    teacher_id: a.Teacher_ID,
    job_id: a.Job_ID,
    apply_date: a.Apply_Date,
    status: a.Status,
    big5_score: a.Big5_Score,
  };
}

function formatJobPost(post, { school, applications, applicantsCount } = {}) {
  const raw = post.toJSON ? post.toJSON() : { ...post };
  const schoolData = school || raw.School || null;
  const apps = applications ?? raw.Applications ?? [];

  return {
    ...raw,
    school_id: raw.School_ID,
    job_id: raw.Job_ID,
    id: `${raw.School_ID}-${raw.Job_ID}`,
    school: formatSchool(schoolData),
    subjects: parseJsonField(raw.Subjects),
    responsibilities: parseJsonField(raw.Responsibilities),
    requirements: parseJsonField(raw.Requirements),
    benefits: parseJsonField(raw.Benefits),
    applicants_count: applicantsCount ?? raw.Applicants_Count ?? apps.length ?? 0,
    applications: apps.map(formatApplication).filter(Boolean),
    job_type: raw.Job_Type,
    required_experience: raw.Required_Experience,
    required_qualifications: raw.Required_Qualifications,
    start_date: raw.Start_Date,
    salary_range: raw.Salary_Range,
    required_stage: raw.Required_Stage ?? null,
    teaching_style: raw.Teaching_Style,
    classroom_energy: raw.Classroom_Energy,
    leadership_style: raw.Leadership_Style,
    communication_style: raw.Communication_Style,
    problem_solving: raw.Problem_Solving,
    school_rating: raw.School_Rating,
  };
}

async function getApplicationCounts(pairs) {
  // pairs: [{ School_ID, Job_ID }] — count per (School_ID, Job_ID) because Job_ID
  // alone is shared across schools and would over-count.
  if (!pairs.length) return new Map();
  const rows = await AppliedJob.findAll({
    attributes: [
      "School_ID",
      "Job_ID",
      [sequelize.fn("COUNT", sequelize.col("Teacher_ID")), "count"],
    ],
    where: { [Op.or]: pairs },
    group: ["School_ID", "Job_ID"],
    raw: true,
  });
  return new Map(rows.map((r) => [`${r.School_ID}-${r.Job_ID}`, Number(r.count)]));
}

async function enrichJobs(rows, { includeApplications = false } = {}) {
  if (!rows.length) return [];

  const plainRows = rows.map((r) => (r.toJSON ? r.toJSON() : r));
  const pairs = plainRows.map((r) => ({ School_ID: r.School_ID, Job_ID: r.Job_ID }));
  const countMap = await getApplicationCounts(pairs);

  const applicationsByJob = new Map();
  if (includeApplications) {
    for (const row of plainRows) {
      const key = `${row.School_ID}-${row.Job_ID}`;
      if (row.Applications?.length) {
        applicationsByJob.set(key, row.Applications);
      }
    }
    const missingPairs = plainRows
      .filter((r) => !applicationsByJob.has(`${r.School_ID}-${r.Job_ID}`))
      .map((r) => ({ School_ID: r.School_ID, Job_ID: r.Job_ID }));

    if (missingPairs.length) {
      const applications = await AppliedJob.findAll({
        where: { [Op.or]: missingPairs },
        order: [["Apply_Date", "DESC"]],
      });
      for (const app of applications) {
        const key = `${app.School_ID}-${app.Job_ID}`;
        const list = applicationsByJob.get(key) || [];
        list.push(app);
        applicationsByJob.set(key, list);
      }
    }
  }

  return plainRows.map((row) => {
    const school = row.School || null;
    const key = `${row.School_ID}-${row.Job_ID}`;
    const apps = includeApplications ? (applicationsByJob.get(key) || []) : [];
    return formatJobPost(row, {
      school,
      applications: apps,
      applicantsCount: countMap.get(key) ?? row.Applicants_Count ?? 0,
    });
  });
}

// ── getAllPosts ────────────────────────────────────────────────────────────
async function getAllPosts({ search, location, job_type, specialization, type, teacherSpecialization, page = 1, limit = 20 } = {}) {
  const conditions = [buildPublicStatusWhere()];

  if (type === "myJobs" && teacherSpecialization) {
    conditions.push({ Specialization: { [Op.like]: `%${teacherSpecialization}%` } });
  }

  if (search) {
    conditions.push({
      [Op.or]: [
        { Title: { [Op.like]: `%${search}%` } },
        { Description: { [Op.like]: `%${search}%` } },
        { Content: { [Op.like]: `%${search}%` } },
        { Specialization: { [Op.like]: `%${search}%` } },
      ],
    });
  }
  if (location)       conditions.push({ Location: { [Op.like]: `%${location}%` } });
  if (job_type)       conditions.push({ Job_Type: job_type });
  if (specialization) conditions.push({ Specialization: { [Op.like]: `%${specialization}%` } });

  const where = { [Op.and]: conditions };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  // findAndCountAll with distinct:true miscounts on composite-PK tables — run count separately
  const count = await Post.count({ where, distinct: false });
  const rows  = await Post.findAll({
    where,
    include: JOB_INCLUDE,
    order: [["Date", "DESC"], ["Job_ID", "DESC"]],
    limit: limitNum,
    offset,
    subQuery: false,
  });

  const jobs = await enrichJobs(rows);

  return {
    total: count,
    page: pageNum,
    total_pages: Math.ceil(count / limitNum) || 0,
    jobs,
  };
}

// ── getMyPosts ────────────────────────────────────────────────────────────
async function getMyPosts(schoolId, { page = 1, limit = 20 } = {}) {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const where = { School_ID: schoolId };
  const count = await Post.count({ where, distinct: false });
  const rows  = await Post.findAll({
    where,
    include: JOB_INCLUDE,
    order: [["Date", "DESC"], ["Job_ID", "DESC"]],
    limit: limitNum,
    offset,
    subQuery: false,
  });

  const jobs = await enrichJobs(rows);

  return {
    total: count,
    page: pageNum,
    total_pages: Math.ceil(count / limitNum) || 0,
    jobs,
  };
}

// ── getPostById ───────────────────────────────────────────────────────────
async function getPostById(schoolId, jobId) {
  // NOTE: AppliedJob is NOT a Sequelize-associated child of Post (Post has a
  // composite PK School_ID+Job_ID which Sequelize can't express as a single FK).
  // Applications are fetched manually inside enrichJobs({ includeApplications }).
  const post = await Post.findOne({
    where: { School_ID: schoolId, Job_ID: jobId },
    include: JOB_INCLUDE,
  });

  if (!post) throw new Error("Job not found.");

  const [enriched] = await enrichJobs([post], { includeApplications: true });
  return enriched;
}

// ── createJobPost ─────────────────────────────────────────────────────────
async function createJobPost(schoolId, data) {
  // Enforce plan limits before creating the post
  await checkJobPostLimit(schoolId);

  const lastJob = await Post.findOne({
    where: { School_ID: schoolId },
    order: [["Job_ID", "DESC"]],
  });
  const nextJobId = data.Job_ID != null ? parseInt(data.Job_ID, 10) : (lastJob ? lastJob.Job_ID + 1 : 1);

  const post = await Post.create({
    ...data,
    School_ID: schoolId,
    Job_ID: nextJobId,
    Date: data.Date || new Date(),
    Status: data.Status || "active",
  });

  const matchingTeachers = await findMatchingTeachers(post);
  await sendJobNotifications(post, matchingTeachers);

  const created = await Post.findOne({
    where: { School_ID: schoolId, Job_ID: nextJobId },
    include: JOB_INCLUDE,
  });

  const [formatted] = await enrichJobs([created]);
  return { job: formatted, notified: matchingTeachers.length };
}

// ── updateJobPost ─────────────────────────────────────────────────────────
async function updateJobPost(schoolId, jobId, data) {
  const post = await Post.findOne({
    where: { School_ID: schoolId, Job_ID: jobId },
  });

  if (!post) throw new Error("Job not found.");

  await post.update(data);

  const updated = await Post.findOne({
    where: { School_ID: schoolId, Job_ID: jobId },
    include: JOB_INCLUDE,
  });

  const [formatted] = await enrichJobs([updated]);
  return formatted;
}

// ── deleteJobPost ─────────────────────────────────────────────────────────
async function deleteJobPost(schoolId, jobId) {
  const post = await Post.findOne({
    where: { School_ID: schoolId, Job_ID: jobId },
  });

  if (!post) throw new Error("Job not found.");

  await post.destroy();
  return { message: "Job post deleted successfully." };
}

// ── findMatchingTeachers ───────────────────────────────────────────────────
async function findMatchingTeachers(post) {
  try {
    const where = { Role: "teacher" };
    if (post.Specialization) {
      where.Specialization = post.Specialization;
    }
    if (post.Required_Experience) {
      where.Years_of_Experience = { [Op.gte]: post.Required_Experience };
    }
    return await Teacher.findAll({ where });
  } catch (error) {
    console.error("[JobPosts] findMatchingTeachers error:", error.message);
    return [];
  }
}

async function sendJobNotifications(post, teachers) {
  if (!teachers || teachers.length === 0) return;
  for (const teacher of teachers) {
    await notifService.createNotification(
      teacher.Teacher_ID,
      "job_match",
      "New Job Match",
      `A new job "${post.Title}" matches your specialization and experience.`,
      post.Job_ID
    );
  }
}

module.exports = {
  getAllPosts,
  getMyPosts,
  getPostById,
  createJobPost,
  updateJobPost,
  deleteJobPost,
  findMatchingTeachers,
  sendJobNotifications,
  formatJobPost,
};