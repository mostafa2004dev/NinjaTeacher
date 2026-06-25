const { Op }     = require("sequelize");
const Post       = require("../jobPosts/jobPosts.model");
const AppliedJob = require("../appliedJobs/appliedJobs.model");
const Teacher    = require("../users/users.model");
const notifService = require("../notifications/notifications.service");
const { calculateMatchScore } = require("../aiMatching/aiMatching.service");

// ── getAllJobs ─────────────────────────────────────────────────────────────
async function getAllJobs({ search, page = 1, limit = 20 }) {
  const where = {};
  if (search) {
    where[Op.or] = [
      { Title:          { [Op.like]: `%${search}%` } },
      { Specialization: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await Post.findAndCountAll({
    where,
    order: [["Date", "DESC"]],
    limit:  parseInt(limit),
    offset,
  });

  return {
    total:       count,
    page:        parseInt(page),
    total_pages: Math.ceil(count / parseInt(limit)),
    jobs:        rows.map(r => {
      const plain = r.toJSON ? r.toJSON() : r;
      return { ...plain, id: `${plain.School_ID}-${plain.Job_ID}` };
    }),
  };
}

// ── updateJob ─────────────────────────────────────────────────────────────
async function updateJob(schoolId, jobId, updates) {
  const job = await Post.findOne({
    where: { School_ID: parseInt(schoolId), Job_ID: parseInt(jobId) },
  });
  if (!job) throw new Error("Job post not found.");

  const allowed = ["Title", "Specialization", "Required_Experience", "Content", "Description"];
  for (const field of allowed) {
    if (updates[field] !== undefined) job[field] = updates[field];
  }
  await job.save();
  return job;
}

// ── deleteJob ─────────────────────────────────────────────────────────────
async function deleteJob(schoolId, jobId) {
  const job = await Post.findOne({
    where: { School_ID: parseInt(schoolId), Job_ID: parseInt(jobId) },
  });
  if (!job) throw new Error("Job post not found.");

  const title = job.Title;
  await job.destroy();
  return { message: `Job "${title}" has been deleted.` };
}

// ── getAllApplications ─────────────────────────────────────────────────────
// كل تقديمات النظام مع فلترة بالـ status
async function getAllApplications({ status, page = 1, limit = 20 }) {
  const where = {};
  if (status) where.Status = status;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await AppliedJob.findAndCountAll({
    where,
    order: [["Apply_Date", "DESC"]],
    limit:  parseInt(limit),
    offset,
  });

  return {
    total:        count,
    page:         parseInt(page),
    total_pages:  Math.ceil(count / parseInt(limit)),
    applications: rows,
  };
}

// ── updateApplicationStatus ───────────────────────────────────────────────
async function updateApplicationStatus(teacherId, jobId, newStatus) {
  const allowed = ["pending", "interview", "accepted", "rejected"];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Status must be one of: ${allowed.join(", ")}`);
  }

  const application = await AppliedJob.findOne({
    where: { Teacher_ID: parseInt(teacherId), Job_ID: parseInt(jobId) },
  });
  if (!application) throw new Error("Application not found.");

  const old_status = application.Status;
  application.Status = newStatus;
  await application.save();

  // بعت notification للمعلم
  await notifService.createNotification(
    teacherId,
    "status_update",
    "Application Status Updated",
    `Your application status changed from "${old_status}" to "${newStatus}".`,
    parseInt(jobId)
  );

  return application;
}

// ── approveJob ─────────────────────────────────────────────────────────────
async function approveJob(compositeId) {
  const parts = compositeId.split("-");
  const schoolId = parseInt(parts[0], 10);
  const jobId = parseInt(parts[1], 10);
  if (!schoolId || !jobId) throw new Error("Invalid job id format.");
  const job = await Post.findOne({ where: { School_ID: schoolId, Job_ID: jobId } });
  if (!job) throw new Error("Job post not found.");
  job.Status = "active";
  await job.save();
  return { id: compositeId, Status: job.Status };
}

// ── rejectJob ──────────────────────────────────────────────────────────────
async function rejectJob(compositeId) {
  const parts = compositeId.split("-");
  const schoolId = parseInt(parts[0], 10);
  const jobId = parseInt(parts[1], 10);
  if (!schoolId || !jobId) throw new Error("Invalid job id format.");
  const job = await Post.findOne({ where: { School_ID: schoolId, Job_ID: jobId } });
  if (!job) throw new Error("Job post not found.");
  job.Status = "rejected";
  await job.save();
  return { id: compositeId, Status: job.Status };
}

// ── runAIMatchingForAllApplications ───────────────────────────────────────
// Recomputes calculateMatchScore(teacher, job) for every application and
// writes the result back to Application.Big5_Score in the database.
async function runAIMatchingForAllApplications() {
  const applications = await AppliedJob.findAll();
  if (!applications.length) return { updated: 0, total: 0 };

  let updated = 0;
  await Promise.all(
    applications.map(async (app) => {
      try {
        const [teacher, job] = await Promise.all([
          Teacher.findByPk(app.Teacher_ID),
          Post.findOne({ where: { School_ID: app.School_ID, Job_ID: app.Job_ID } }),
        ]);
        if (!teacher || !job) return;
        const score = calculateMatchScore(teacher.toJSON(), job.toJSON());
        await app.update({ Big5_Score: score });
        updated++;
      } catch (_) { /* skip individual failures */ }
    })
  );

  const rows = await AppliedJob.findAll({ order: [["Apply_Date", "DESC"]], limit: 50 });
  return { updated, total: applications.length, applications: rows };
}

module.exports = {
  getAllJobs,
  updateJob,
  deleteJob,
  getAllApplications,
  updateApplicationStatus,
  approveJob,
  rejectJob,
  runAIMatchingForAllApplications,
};
