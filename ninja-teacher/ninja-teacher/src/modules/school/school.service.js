const { Op } = require("sequelize");
const Post = require("../jobPosts/jobPosts.model");
const AppliedJob = require("../appliedJobs/appliedJobs.model");
const Teacher = require("../users/users.model");
const notifService = require("../notifications/notifications.service");
const { calculateMatchScore } = require("../aiMatching/aiMatching.service");
const { checkJobPostLimit } = require("../subscriptions/subscription.limits");

// ── getSchoolDashboard ─────────────────────────────────────────────────────
async function getSchoolDashboard(schoolId) {
  const [active_jobs, total_jobs] = await Promise.all([
    Post.count({ where: { School_ID: schoolId, Status: "active" } }),
    Post.count({ where: { School_ID: schoolId } }),
  ]);

  const schoolJobs = await Post.findAll({
    where: { School_ID: schoolId },
    attributes: ["School_ID", "Job_ID"],
  });

  const jobPairs = schoolJobs.map(j => ({ School_ID: j.School_ID, Job_ID: j.Job_ID }));

  const [total_applicants, pending_review, hired] = jobPairs.length > 0
    ? await Promise.all([
      AppliedJob.count({ where: { [Op.or]: jobPairs } }),
      AppliedJob.count({ where: { [Op.and]: [{ [Op.or]: jobPairs }, { Status: "pending" }] } }),
      AppliedJob.count({ where: { [Op.and]: [{ [Op.or]: jobPairs }, { Status: "accepted" }] } }),
    ])
    : [0, 0, 0];

  return { active_jobs, total_jobs, total_applicants, pending_review, hired };
}

// ── getSchoolJobs ─────────────────────────────────────────────────────────
async function getSchoolJobs(schoolId, { status, search, page = 1, limit = 20 }) {
  const where = { School_ID: schoolId };
  if (status) where.Status = status;
  if (search) where.Title = { [Op.like]: `%${search}%` };

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await Post.findAndCountAll({
    where,
    order: [["Date", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  return {
    total: count,
    page: parseInt(page),
    total_pages: Math.ceil(count / parseInt(limit)),
    jobs: rows,
  };
}

// ── createJob ─────────────────────────────────────────────────────────────
async function createJob(schoolId, data) {
  await checkJobPostLimit(schoolId);

  const lastJob = await Post.findOne({
    where: { School_ID: schoolId },
    order: [["Job_ID", "DESC"]],
  });
  const nextJobId = lastJob ? lastJob.Job_ID + 1 : 1;

  const job = await Post.create({
    ...data,
    School_ID: schoolId,
    Job_ID: nextJobId,
    Date: new Date(),
  });

  const teachers = await Teacher.findAll({ where: { Role: "teacher" } });
  for (const teacher of teachers) {
    const score = calculateMatchScore(teacher, job);
    if (score >= 60) {
      await notifService.createNotification(
        teacher.Teacher_ID,
        "job_match",
        "New Job Match",
        `A new job "${job.Title}" matches your profile with ${score}% compatibility.`,
        nextJobId
      );
    }
  }

  return job;
}

// ── updateJob ─────────────────────────────────────────────────────────────
async function updateJob(schoolId, jobId, data) {
  const job = await Post.findOne({ where: { School_ID: schoolId, Job_ID: jobId } });
  if (!job) throw new Error("Job not found.");

  const allowed = [
    "Title", "Location", "Subjects", "Specialization", "Job_Type",
    "Required_Experience", "Required_Qualifications", "Start_Date",
    "Deadline", "Salary_Range", "Content", "Description",
    "Responsibilities", "Requirements", "Benefits",
    "Teaching_Style", "Classroom_Energy", "Leadership_Style",
    "Communication_Style", "Problem_Solving", "Status", "Required_Stage",
  ];

  for (const field of allowed) {
    if (data[field] !== undefined) job[field] = data[field];
  }
  await job.save();
  return job;
}

// ── deleteJob ─────────────────────────────────────────────────────────────
async function deleteJob(schoolId, jobId) {
  const job = await Post.findOne({ where: { School_ID: schoolId, Job_ID: jobId } });
  if (!job) throw new Error("Job not found.");
  await job.destroy();
  return true;
}

// ── getJobApplicants ──────────────────────────────────────────────────────
async function getJobApplicants(schoolId, jobId, { status, page = 1, limit = 20 }) {
  const job = await Post.findOne({ where: { School_ID: schoolId, Job_ID: jobId } });
  if (!job) throw new Error("Job not found.");

  const where = { School_ID: schoolId, Job_ID: jobId };
  if (status) where.Status = status;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await AppliedJob.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order: [["Apply_Date", "DESC"]],
  });

  const enriched = await Promise.all(rows.map(async app => {
    const teacher = await Teacher.findByPk(app.Teacher_ID, {
      attributes: { exclude: ["Password"] },
    });
    const matchScore = teacher ? calculateMatchScore(teacher, job) : 0;
    return { ...app.toJSON(), teacher: teacher?.toJSON() || null, match_score: matchScore };
  }));

  return {
    total: count,
    page: parseInt(page),
    total_pages: Math.ceil(count / parseInt(limit)),
    applicants: enriched,
  };
}

// ── updateApplicantStatus ─────────────────────────────────────────────────
async function updateApplicantStatus(schoolId, jobId, teacherId, newStatus, message) {
  const job = await Post.findOne({ where: { School_ID: schoolId, Job_ID: jobId } });
  if (!job) throw new Error("Job not found.");

  const application = await AppliedJob.findOne({
    where: { Teacher_ID: teacherId, School_ID: schoolId, Job_ID: jobId },
  });
  if (!application) throw new Error("Application not found.");

  application.Status = newStatus;
  await application.save();

  const statusMessages = {
    shortlisted: `You've been shortlisted for the position of "${job.Title}".`,
    interview: `Congratulations! You've been shortlisted for an interview for "${job.Title}".`,
    accepted: `Great news! You've been accepted for the position of "${job.Title}".`,
    rejected: `We're sorry, your application for "${job.Title}" was not selected this time.`,
    pending: `Your application for "${job.Title}" is under review.`,
  };

  await notifService.createNotification(
    teacherId,
    "status_update",
    "Application Update",
    message || statusMessages[newStatus] || `Application status changed to ${newStatus}.`,
    jobId
  );

  return application;
}

// ── getAllApplicants ──────────────────────────────────────────────────────────
// Returns all applicants across every job owned by this school in one query.
// Eliminates the N+1 pattern in useApplicants.js.
async function getAllApplicants(schoolId) {
  const schoolJobs = await Post.findAll({
    where: { School_ID: schoolId },
    attributes: ["School_ID", "Job_ID", "Title"],
  });
  if (!schoolJobs.length) return [];

  const pairs = schoolJobs.map(j => ({ School_ID: j.School_ID, Job_ID: j.Job_ID }));
  const applications = await AppliedJob.findAll({
    where: { [Op.or]: pairs },
    order: [["Apply_Date", "DESC"]],
  });

  const jobMap = new Map(schoolJobs.map(j => [`${j.School_ID}-${j.Job_ID}`, j]));

  return Promise.all(applications.map(async (app) => {
    const job = jobMap.get(`${app.School_ID}-${app.Job_ID}`);
    const teacher = await Teacher.findByPk(app.Teacher_ID, {
      attributes: { exclude: ["Password"] },
    });
    const matchScore = teacher && job ? calculateMatchScore(teacher, job) : 0;
    return {
      ...app.toJSON(),
      job_title: job?.Title ?? null,
      match_score: matchScore,
      teacher: teacher?.toJSON() ?? null,
    };
  }));
}

module.exports = {
  getSchoolDashboard,
  getSchoolJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobApplicants,
  getAllApplicants,
  updateApplicantStatus,
};