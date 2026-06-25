const { Op } = require("sequelize");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Notification = require("../notifications/notifications.model");
const AppliedJob = require("../appliedJobs/appliedJobs.model");
const Post = require("../jobPosts/jobPosts.model");
const Teacher = require("../users/users.model");

// Saved jobs table (synced via sequelize.sync alter)
const SavedJob =
  sequelize.models.SavedJob ||
  sequelize.define(
    "SavedJob",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Teacher_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      School_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Job_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "SavedJobs",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["Teacher_ID", "School_ID", "Job_ID"] },
        { fields: ["Teacher_ID"] },
      ],
    }
  );

const SCHOOL_ATTRS = [
  "Teacher_ID", "Name", "Email", "Phone", "Image", "Location",
  "School_Name", "School_Type", "School_Size", "Average_Rating", "Role",
];

const POST_INCLUDE = [
  { model: Teacher, as: "School", attributes: SCHOOL_ATTRS, required: false },
];

function parseTeacherId(teacherId) {
  const id = parseInt(teacherId, 10);
  if (!id || Number.isNaN(id)) throw new Error("Invalid teacher id.");
  return id;
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
    name: t.School_Name || t.Name,
    school_name: t.School_Name || t.Name,
    image: t.Image ?? null,
    location: t.Location ?? null,
    rating: t.Average_Rating ?? 0,
  };
}

function formatJob(post) {
  if (!post) return null;
  const raw = post.toJSON ? post.toJSON() : post;
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
    Date: raw.Date,
    date: raw.Date,
    Status: raw.Status,
    status: raw.Status,
    Job_Type: raw.Job_Type,
    job_type: raw.Job_Type,
    Specialization: raw.Specialization,
    specialization: raw.Specialization,
    Salary_Range: raw.Salary_Range,
    salary_range: raw.Salary_Range,
    subjects: parseJsonField(raw.Subjects),
    school: formatSchool(raw.School),
  };
}

function formatApplication(app, post = null) {
  const raw = app.toJSON ? app.toJSON() : app;
  const formattedJob = formatJob(post);
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
  return `${schoolId}-${jobId}`;
}

async function fetchPostsByPairs(pairs) {
  if (!pairs.length) return new Map();

  const conditions = pairs.map((p) => ({
    School_ID: p.schoolId,
    Job_ID: p.jobId,
  }));

  const posts = await Post.findAll({
    where: { [Op.or]: conditions },
    include: POST_INCLUDE,
  });

  const map = new Map();
  for (const post of posts) {
    map.set(postLookupKey(post.School_ID, post.Job_ID), post);
  }
  return map;
}

async function getApplicationStats(teacherId) {
  const [total, pending, interviews, accepted, rejected] = await Promise.all([
    AppliedJob.count({ where: { Teacher_ID: teacherId } }),
    AppliedJob.count({ where: { Teacher_ID: teacherId, Status: "pending" } }),
    AppliedJob.count({ where: { Teacher_ID: teacherId, Status: "interview" } }),
    AppliedJob.count({ where: { Teacher_ID: teacherId, Status: "accepted" } }),
    AppliedJob.count({ where: { Teacher_ID: teacherId, Status: "rejected" } }),
  ]);

  const by_status = {
    pending,
    interview: interviews,
    accepted,
    rejected,
  };

  return {
    total,
    pending,
    interviews,
    interview: interviews,
    offers: accepted,
    accepted,
    rejected,
    by_status,
  };
}

async function getRecentAppliedJobs(teacherId, limit = 10) {
  const applications = await AppliedJob.findAll({
    where: { Teacher_ID: teacherId },
    order: [["Apply_Date", "DESC"]],
    limit,
  });

  if (!applications.length) return [];

  const pairs = applications.map((a) => ({
    schoolId: a.School_ID,
    jobId: a.Job_ID,
  })).filter((p) => p.schoolId != null);

  const legacyJobIds = applications
    .filter((a) => a.School_ID == null)
    .map((a) => a.Job_ID);

  const postMap = await fetchPostsByPairs(pairs);

  if (legacyJobIds.length) {
    const legacyPosts = await Post.findAll({
      where: { Job_ID: { [Op.in]: legacyJobIds } },
      include: POST_INCLUDE,
    });
    for (const post of legacyPosts) {
      const key = postLookupKey(post.School_ID, post.Job_ID);
      if (!postMap.has(key)) postMap.set(key, post);
    }
  }

  return applications.map((app) => {
    const schoolId = app.School_ID;
    const post =
      schoolId != null
        ? postMap.get(postLookupKey(schoolId, app.Job_ID))
        : [...postMap.values()].find((p) => p.Job_ID === app.Job_ID) || null;
    return formatApplication(app, post);
  });
}

async function getSavedJobsForTeacher(teacherId, limit = 20) {
  let savedRows = [];
  try {
    savedRows = await SavedJob.findAll({
      where: { Teacher_ID: teacherId },
      order: [["createdAt", "DESC"]],
      limit,
    });
  } catch (err) {
    console.error("[Dashboard] SavedJobs query failed:", err.message);
    return [];
  }

  if (!savedRows.length) return [];

  const pairs = savedRows.map((s) => ({
    schoolId: s.School_ID,
    jobId: s.Job_ID,
  }));

  const postMap = await fetchPostsByPairs(pairs);

  return savedRows.map((saved) => {
    const raw = saved.toJSON ? saved.toJSON() : saved;
    const post = postMap.get(postLookupKey(raw.School_ID, raw.Job_ID));
    const job = formatJob(post);
    return {
      id: raw.id,
      teacher_id: raw.Teacher_ID,
      school_id: raw.School_ID,
      job_id: raw.Job_ID,
      saved_at: raw.createdAt,
      job,
      Post: job,
    };
  }).filter((item) => item.job != null);
}

async function buildRecentActivity(teacherId, limit = 15) {
  const [applications, notifications] = await Promise.all([
    AppliedJob.findAll({
      where: { Teacher_ID: teacherId },
      order: [["Apply_Date", "DESC"]],
      limit: 10,
    }),
    Notification.findAll({
      where: { Teacher_ID: teacherId },
      order: [["createdAt", "DESC"]],
      limit: 10,
    }),
  ]);

  const appPairs = applications
    .filter((a) => a.School_ID != null)
    .map((a) => ({ schoolId: a.School_ID, jobId: a.Job_ID }));
  const postMap = await fetchPostsByPairs(appPairs);

  const activity = [];

  for (const app of applications) {
    const post =
      app.School_ID != null
        ? postMap.get(postLookupKey(app.School_ID, app.Job_ID))
        : null;
    activity.push({
      type: "application",
      date: app.Apply_Date || app.createdAt,
      title: post ? `Applied to ${post.Title}` : "Job application",
      message: `Application status: ${app.Status}`,
      status: app.Status,
      related_id: app.Job_ID,
      school_id: app.School_ID,
      job: formatJob(post),
      application: formatApplication(app, post),
    });
  }

  for (const notif of notifications) {
    const raw = notif.toJSON ? notif.toJSON() : notif;
    activity.push({
      type: "notification",
      date: raw.createdAt,
      title: raw.Title,
      message: raw.Message,
      notification_type: raw.Type,
      is_read: Boolean(raw.IsRead),
      related_id: raw.Related_ID,
      school_id: raw.Related_School_ID ?? null,
    });
  }

  return activity
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

// ── getTeacherStats / full dashboard ─────────────────────────────────────────
async function getTeacherStats(teacherId) {
  const id = parseTeacherId(teacherId);

  try {
    const [
      profileViews,
      applicationStats,
      saved_count,
      applied_jobs,
      saved_jobs,
      recent_activity,
    ] = await Promise.all([
      Notification.count({ where: { Teacher_ID: id, Type: "profile_view" } }),
      getApplicationStats(id),
      SavedJob.count({ where: { Teacher_ID: id } }).catch(() => 0),
      getRecentAppliedJobs(id, 10),
      getSavedJobsForTeacher(id, 20),
      buildRecentActivity(id, 15),
    ]);

    const stats = {
      profileViews,
      applications: applicationStats.total,
      interviews: applicationStats.interviews,
      offers: applicationStats.offers,
      pending: applicationStats.pending,
      rejected: applicationStats.rejected,
      saved_count,
      by_status: applicationStats.by_status,
    };

    return {
      ...stats,
      stats,
      applied_jobs,
      saved_jobs,
      recent_activity,
    };
  } catch (error) {
    console.error("[Dashboard] getTeacherStats error:", error.message);
    return {
      profileViews: 0,
      applications: 0,
      interviews: 0,
      offers: 0,
      pending: 0,
      rejected: 0,
      saved_count: 0,
      by_status: { pending: 0, interview: 0, accepted: 0, rejected: 0 },
      stats: {
        profileViews: 0,
        applications: 0,
        interviews: 0,
        offers: 0,
        pending: 0,
        rejected: 0,
        saved_count: 0,
        by_status: { pending: 0, interview: 0, accepted: 0, rejected: 0 },
      },
      applied_jobs: [],
      saved_jobs: [],
      recent_activity: [],
    };
  }
}

// ── saveJob / unsaveJob (for dashboard save actions) ─────────────────────────
async function saveJob(teacherId, schoolId, jobId) {
  const tid = parseTeacherId(teacherId);
  const sid = parseInt(schoolId, 10);
  const jid = parseInt(jobId, 10);

  if (!sid || Number.isNaN(sid) || !jid || Number.isNaN(jid)) {
    throw new Error("Valid school_id and job_id are required.");
  }

  const post = await Post.findOne({
    where: { School_ID: sid, Job_ID: jid },
  });
  if (!post) throw new Error("Job not found.");

  await SavedJob.findOrCreate({
    where: { Teacher_ID: tid, School_ID: sid, Job_ID: jid },
    defaults: { Teacher_ID: tid, School_ID: sid, Job_ID: jid },
  });

  const row = await SavedJob.findOne({
    where: { Teacher_ID: tid, School_ID: sid, Job_ID: jid },
  });

  const postFull = await Post.findOne({
    where: { School_ID: sid, Job_ID: jid },
    include: POST_INCLUDE,
  });

  return {
    id: row.id,
    teacher_id: tid,
    school_id: sid,
    job_id: jid,
    saved_at: row.createdAt,
    job: formatJob(postFull),
    Post: formatJob(postFull),
  };
}

async function unsaveJob(teacherId, schoolId, jobId) {
  const tid = parseTeacherId(teacherId);
  const sid = parseInt(schoolId, 10);
  const jid = parseInt(jobId, 10);

  const deleted = await SavedJob.destroy({
    where: { Teacher_ID: tid, School_ID: sid, Job_ID: jid },
  });

  if (!deleted) throw new Error("Saved job not found.");
  return true;
}

module.exports = {
  SavedJob,
  getTeacherStats,
  getSavedJobsForTeacher,
  saveJob,
  unsaveJob,
};
