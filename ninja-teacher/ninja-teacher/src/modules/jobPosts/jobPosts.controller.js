const jobService = require("./jobPosts.service");
const jwt = require("jsonwebtoken");
const Teacher = require("../users/users.model");

// GET /job-posts
exports.getAllPosts = async (req, res) => {
  try {
    const params = { ...req.query };
    if (params.type === "myJobs") {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          // Use AI-scored recommendations instead of fragile LIKE filter
          const { getRecommendedJobsForTeacher } = require("../aiMatching/aiMatching.service");
          const jobs = await getRecommendedJobsForTeacher(decoded.id, parseInt(params.limit, 10) || 20);
          return res.status(200).json({
            status: "success",
            data: { total: jobs.length, page: 1, total_pages: 1, jobs },
          });
        } catch { /* invalid/expired token — fall through to unfiltered list */ }
      }
    }
    const data = await jobService.getAllPosts(params);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /job-posts/my — بوستات الـ school اللي عامل login
exports.getMyPosts = async (req, res) => {
  try {
    const schoolId = parseInt(req.user?.Teacher_ID || req.user?.id, 10);
    const data = await jobService.getMyPosts(schoolId, req.query);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /job-posts/:schoolId/:jobId
exports.getPostById = async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId, 10);
    const jobId = parseInt(req.params.jobId, 10);
    if (Number.isNaN(schoolId) || Number.isNaN(jobId)) {
      return res.status(400).json({ status: "fail", message: "Invalid schoolId or jobId." });
    }
    const post = await jobService.getPostById(schoolId, jobId);
    return res.status(200).json({ status: "success", data: post });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

function parseExperience(value) {
  if (!value) return 0;
  const match = String(value).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function firstOrNull(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[0];
}

// POST /job-posts
exports.createJobPost = async (req, res) => {
  try {
    // School_ID is derived ONLY from the authenticated JWT context, never the
    // client payload. req.user is the Teacher instance whose PK is Teacher_ID
    // (there is no `id` attribute), so we read Teacher_ID and fall back to id.
    const schoolId = parseInt(req.user?.Teacher_ID ?? req.user?.id, 10);
    if (!schoolId || Number.isNaN(schoolId)) {
      return res.status(401).json({ status: "fail", message: "Authenticated school account is required." });
    }
    // Only school accounts may post jobs.
    if (req.user?.Role && req.user.Role !== "school") {
      return res.status(403).json({ status: "fail", message: "Only school accounts can post jobs." });
    }

    const { jobDetails = {}, personality = {} } = req.body;

    if (!jobDetails.positionTitle?.trim()) {
      return res.status(400).json({ status: "fail", message: "Position title is required." });
    }
    if (!jobDetails.location?.trim()) {
      return res.status(400).json({ status: "fail", message: "Location is required." });
    }
    if (!jobDetails.subjects?.length) {
      return res.status(400).json({ status: "fail", message: "At least one subject is required." });
    }
    if (!jobDetails.required_stage?.trim()) {
      return res.status(400).json({ status: "fail", message: "Required stage is required." });
    }

    const mappedData = {
      Title: jobDetails.positionTitle,
      Location: jobDetails.location,
      Subjects: jobDetails.subjects || [],
      Required_Stage: jobDetails.required_stage,
      Salary_Range: jobDetails.salaryRange || null,
      Required_Experience: parseExperience(jobDetails.requiredExperience),
      Required_Qualifications: jobDetails.qualifications || null,
      Start_Date: jobDetails.startDate || null,
      Description: jobDetails.additionalInfo || null,
      Teaching_Style: firstOrNull(personality.teachingStyle),
      Classroom_Energy: firstOrNull(personality.classroomEnergy),
      Leadership_Style: firstOrNull(personality.leadershipStyle),
      Communication_Style: firstOrNull(personality.communicationStyle),
      Problem_Solving: firstOrNull(personality.problemSolving),
      Status: "active",
      Date: new Date(),
    };

    const { job, notified } = await jobService.createJobPost(schoolId, mappedData);

    return res.status(201).json({
      status: "success",
      message: "Job post created successfully.",
      data: job,
      notified,
    });
  } catch (err) {
    const isLimitError = err.message.includes("limit") || err.message.includes("Upgrade");
    const code = isLimitError ? 400 : 500;
    return res.status(code).json({ status: isLimitError ? "fail" : "error", message: err.message });
  }
};

// PUT /job-posts/:jobId
exports.updateJobPost = async (req, res) => {
  try {
    const schoolId = parseInt(req.user?.Teacher_ID || req.user?.id, 10);
    const jobId = parseInt(req.params.jobId, 10);

    if (Number.isNaN(jobId)) {
      return res.status(400).json({ status: "fail", message: "Invalid jobId." });
    }

    const { jobDetails = {}, personality = {} } = req.body;

    const mappedData = {};
    if (jobDetails.positionTitle) mappedData.Title = jobDetails.positionTitle;
    if (jobDetails.location) mappedData.Location = jobDetails.location;
    if (jobDetails.subjects) mappedData.Subjects = jobDetails.subjects;
    if (jobDetails.salaryRange) mappedData.Salary_Range = jobDetails.salaryRange;
    if (jobDetails.requiredExperience) mappedData.Required_Experience = parseExperience(jobDetails.requiredExperience);
    if (jobDetails.qualifications) mappedData.Required_Qualifications = jobDetails.qualifications;
    if (jobDetails.startDate) mappedData.Start_Date = jobDetails.startDate;
    if (jobDetails.additionalInfo) mappedData.Description = jobDetails.additionalInfo;
    if (jobDetails.required_stage) mappedData.Required_Stage = jobDetails.required_stage;
    if (personality.teachingStyle) mappedData.Teaching_Style = firstOrNull(personality.teachingStyle);
    if (personality.classroomEnergy) mappedData.Classroom_Energy = firstOrNull(personality.classroomEnergy);
    if (personality.leadershipStyle) mappedData.Leadership_Style = firstOrNull(personality.leadershipStyle);
    if (personality.communicationStyle) mappedData.Communication_Style = firstOrNull(personality.communicationStyle);
    if (personality.problemSolving) mappedData.Problem_Solving = firstOrNull(personality.problemSolving);

    // ── Status toggle (Active/Closed) ──────────────────────────────────────
    // بيتبعت لوحده من الكارت (toggle switch) من غير باقي بيانات الوظيفة،
    // أو ممكن يتبعت مع باقي التعديلات من الـ Edit Wizard لو حبيت تستخدمه هناك كمان.
    const allowedStatuses = ["active", "closed", "draft"];
    if (req.body.status && allowedStatuses.includes(req.body.status)) {
      mappedData.Status = req.body.status;
    }

    const job = await jobService.updateJobPost(schoolId, jobId, mappedData);

    return res.status(200).json({
      status: "success",
      message: "Job post updated successfully.",
      data: job,
    });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// DELETE /job-posts/:jobId
exports.deleteJobPost = async (req, res) => {
  try {
    const schoolId = parseInt(req.user?.Teacher_ID || req.user?.id, 10);
    const jobId = parseInt(req.params.jobId, 10);

    if (Number.isNaN(jobId)) {
      return res.status(400).json({ status: "fail", message: "Invalid jobId." });
    }

    const result = await jobService.deleteJobPost(schoolId, jobId);

    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};