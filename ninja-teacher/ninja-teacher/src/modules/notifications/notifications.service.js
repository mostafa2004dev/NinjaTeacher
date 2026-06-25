const { Op } = require("sequelize");
const Notification = require("./notifications.model");
const Post = require("../jobPosts/jobPosts.model");
const AppliedJob = require("../appliedJobs/appliedJobs.model");
const Teacher = require("../users/users.model");

const SCHOOL_ATTRS = [
  "Teacher_ID", "Name", "Email", "Phone", "Image", "Location",
  "School_Name", "School_Type", "School_Size", "Average_Rating", "Role",
];

const POST_INCLUDE = [
  { model: Teacher, as: "School", attributes: SCHOOL_ATTRS, required: false },
];

const JOB_NOTIFICATION_TYPES = new Set([
  "job_match",
  "application_received",
  "status_update",
  "new_application", // ✅ إشعار المدرسة بوجود طلب تقديم جديد على وظيفتها
]);

const APPLICATION_NOTIFICATION_TYPES = new Set([
  "application_received",
  "status_update",
]);

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
    teacher_id: t.Teacher_ID,
    name: t.School_Name || t.Name,
    school_name: t.School_Name || t.Name,
    image: t.Image ?? null,
    location: t.Location ?? null,
    school_type: t.School_Type ?? null,
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
    Salary_Range: raw.Salary_Range,
    salary_range: raw.Salary_Range,
    Subjects: parseJsonField(raw.Subjects),
    subjects: parseJsonField(raw.Subjects),
    school: formatSchool(raw.School),
  };
}

function formatApplication(app) {
  if (!app) return null;
  const raw = app.toJSON ? app.toJSON() : app;
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
  };
}

function postLookupKey(schoolId, jobId) {
  return schoolId != null ? `${schoolId}-${jobId}` : `job-${jobId}`;
}

function applicationLookupKey(teacherId, schoolId, jobId) {
  return schoolId != null ? `${teacherId}-${schoolId}-${jobId}` : `${teacherId}-job-${jobId}`;
}

async function loadRelatedMaps(notifications, teacherId) {
  const jobIds = [
    ...new Set(
      notifications
        .filter((n) => n.Related_ID != null && JOB_NOTIFICATION_TYPES.has(n.Type))
        .map((n) => n.Related_ID)
    ),
  ];

  const applicationMap = new Map();
  const postMap = new Map();

  if (!jobIds.length) {
    return { applicationMap, postMap };
  }

  const applications = await AppliedJob.findAll({
    where: {
      Teacher_ID: teacherId,
      Job_ID: { [Op.in]: jobIds },
    },
  });

  for (const app of applications) {
    applicationMap.set(
      applicationLookupKey(teacherId, app.School_ID, app.Job_ID),
      app
    );
    applicationMap.set(applicationLookupKey(teacherId, null, app.Job_ID), app);
  }

  const postConditions = [];

  for (const n of notifications) {
    if (!n.Related_ID || !JOB_NOTIFICATION_TYPES.has(n.Type)) continue;
    if (n.Related_School_ID != null) {
      postConditions.push({ School_ID: n.Related_School_ID, Job_ID: n.Related_ID });
    }
  }

  for (const app of applications) {
    if (app.School_ID != null) {
      postConditions.push({ School_ID: app.School_ID, Job_ID: app.Job_ID });
    }
  }

  postConditions.push({ Job_ID: { [Op.in]: jobIds } });

  const posts = await Post.findAll({
    where: postConditions.length === 1 ? postConditions[0] : { [Op.or]: postConditions },
    include: POST_INCLUDE,
  });

  for (const post of posts) {
    postMap.set(postLookupKey(post.School_ID, post.Job_ID), post);
    if (!postMap.has(postLookupKey(null, post.Job_ID))) {
      postMap.set(postLookupKey(null, post.Job_ID), post);
    }
  }

  return { applicationMap, postMap };
}

function resolveApplication(notif, teacherId, applicationMap) {
  if (!notif.Related_ID || !APPLICATION_NOTIFICATION_TYPES.has(notif.Type)) {
    return null;
  }

  if (notif.Related_School_ID != null) {
    return (
      applicationMap.get(
        applicationLookupKey(teacherId, notif.Related_School_ID, notif.Related_ID)
      ) || null
    );
  }

  return (
    applicationMap.get(applicationLookupKey(teacherId, null, notif.Related_ID)) ||
    applicationMap.get(applicationLookupKey(teacherId, notif.Related_School_ID, notif.Related_ID)) ||
    null
  );
}

function resolveJob(notif, application, postMap) {
  if (!notif.Related_ID || !JOB_NOTIFICATION_TYPES.has(notif.Type)) return null;

  const schoolId = notif.Related_School_ID ?? application?.School_ID ?? null;
  if (schoolId != null) {
    return postMap.get(postLookupKey(schoolId, notif.Related_ID)) || null;
  }
  return postMap.get(postLookupKey(null, notif.Related_ID)) || null;
}

function formatNotification(notif, { application = null, job = null } = {}) {
  const raw = notif.toJSON ? notif.toJSON() : notif;
  const formattedApp = application ? formatApplication(application) : null;
  const formattedJob = job ? formatJob(job) : null;

  const related = {};
  if (formattedJob) related.job = formattedJob;
  if (formattedApp) related.application = formattedApp;
  if (raw.Type?.startsWith("subscription") && raw.Related_ID != null) {
    related.subscription_id = raw.Related_ID;
  }

  return {
    Notification_ID: raw.Notification_ID,
    Teacher_ID: raw.Teacher_ID,
    Type: raw.Type,
    Title: raw.Title,
    Message: raw.Message,
    IsRead: Boolean(raw.IsRead),
    Related_ID: raw.Related_ID,
    Related_School_ID: raw.Related_School_ID ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    id: raw.Notification_ID,
    notification_id: raw.Notification_ID,
    teacher_id: raw.Teacher_ID,
    type: raw.Type,
    title: raw.Title,
    message: raw.Message,
    is_read: Boolean(raw.IsRead),
    related_id: raw.Related_ID,
    related_school_id: raw.Related_School_ID ?? null,
    created_at: raw.createdAt,
    updated_at: raw.updatedAt,

    application: formattedApp,
    job: formattedJob,
    related: Object.keys(related).length ? related : null,
  };
}

async function enrichNotifications(notifications, teacherId) {
  if (!notifications.length) return [];

  const { applicationMap, postMap } = await loadRelatedMaps(notifications, teacherId);

  return notifications.map((notif) => {
    const application = resolveApplication(notif, teacherId, applicationMap);
    const job = resolveJob(notif, application, postMap);
    return formatNotification(notif, { application, job });
  });
}

// ── getTeacherNotifications ──────────────────────────────────────────────────
async function getTeacherNotifications(teacherId) {
  const id = parseTeacherId(teacherId);

  const rows = await Notification.findAll({
    where: { Teacher_ID: id },
    order: [
      ["createdAt", "DESC"],
      ["Notification_ID", "DESC"],
    ],
  });

  const notifications = await enrichNotifications(rows, id);
  const unread_count = notifications.filter((n) => !n.is_read).length;

  return {
    total: notifications.length,
    unread_count,
    notifications,
  };
}

// ── markAsRead ───────────────────────────────────────────────────────────────
async function markAsRead(id, teacherId) {
  const tid = parseTeacherId(teacherId);
  const item = await Notification.findOne({
    where: { Notification_ID: id, Teacher_ID: tid },
  });
  if (!item) throw new Error("Notification not found.");

  item.IsRead = true;
  await item.save();

  const [formatted] = await enrichNotifications([item], tid);
  return formatted;
}

// ── markAllAsRead ────────────────────────────────────────────────────────────
async function markAllAsRead(teacherId) {
  const tid = parseTeacherId(teacherId);
  const [count] = await Notification.update(
    { IsRead: true },
    { where: { Teacher_ID: tid, IsRead: false } }
  );
  return count;
}

// ── deleteNotification ───────────────────────────────────────────────────────
async function deleteNotification(id, teacherId) {
  const tid = parseTeacherId(teacherId);
  const target = await Notification.findOne({
    where: { Notification_ID: id, Teacher_ID: tid },
  });
  if (!target) throw new Error("Notification not found.");
  await target.destroy();
  return true;
}

// ── getUnreadCount ───────────────────────────────────────────────────────────
async function getUnreadCount(teacherId) {
  const tid = parseTeacherId(teacherId);
  return await Notification.count({
    where: { Teacher_ID: tid, IsRead: false },
  });
}

// ── createNotification ───────────────────────────────────────────────────────
async function createNotification(teacherId, type, title, msg, refId = null, schoolId = null) {
  try {
    const tid = parseTeacherId(teacherId);
    const relatedSchoolId =
      schoolId != null && !Number.isNaN(parseInt(schoolId, 10))
        ? parseInt(schoolId, 10)
        : null;

    const notif = await Notification.create({
      Teacher_ID: tid,
      Type: type,
      Title: title,
      Message: msg,
      Related_ID: refId != null ? parseInt(refId, 10) || refId : null,
      Related_School_ID: JOB_NOTIFICATION_TYPES.has(type) ? relatedSchoolId : null,
    });

    if (JOB_NOTIFICATION_TYPES.has(type) && notif.Related_ID && !notif.Related_School_ID) {
      const app = await AppliedJob.findOne({
        where: { Teacher_ID: tid, Job_ID: notif.Related_ID },
        order: [["Apply_Date", "DESC"]],
      });
      if (app?.School_ID) {
        notif.Related_School_ID = app.School_ID;
        await notif.save();
      } else {
        const posts = await Post.findAll({
          where: { Job_ID: notif.Related_ID },
          attributes: ["School_ID", "Job_ID"],
          limit: 2,
        });
        if (posts.length === 1) {
          notif.Related_School_ID = posts[0].School_ID;
          await notif.save();
        }
      }
    }

    try {
      const { emitToUser } = require("../../config/socket");
      const [formatted] = await enrichNotifications([notif], tid);
      emitToUser(tid, "notification", formatted);
    } catch (_) {
      /* Socket not ready */
    }

    return notif;
  } catch (err) {
    console.error("[Notification] Failed to create:", err.message);
    return null;
  }
}

module.exports = {
  getTeacherNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
  formatNotification,
  enrichNotifications,
};