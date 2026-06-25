const Teacher    = require("../users/users.model");
const Post       = require("../jobPosts/jobPosts.model");
const AppliedJob = require("../appliedJobs/appliedJobs.model");
const { getTopRatedTeachers, getTestimonials, createTestimonial } = require("../reviews/reviews.service");
const { Op }    = require("sequelize");

// GET /home/stats — banner counts + analytics-compatible cards shape
exports.getStats = async (req, res) => {
  try {
    const [total_teachers, total_schools, total_jobs, active_jobs, total_apps, accepted_apps] = await Promise.all([
      Teacher.count({ where: { Role: "teacher" } }),
      Teacher.count({ where: { Role: "school"  } }),
      Post.count(),
      Post.count({ where: { Status: "active" } }),
      AppliedJob.count(),
      AppliedJob.count({ where: { Status: "accepted" } }),
    ]);
    const acceptance_rate = total_apps > 0 ? Math.round((accepted_apps / total_apps) * 100) : 0;
    return res.status(200).json({
      status: "success",
      data: {
        total_teachers,
        total_schools,
        total_jobs,
        active_jobs,
        match_rate: 95,
        // analytics-compatible shape consumed by AnalyticsPage
        cards: { total_teachers, total_schools, acceptance_rate },
      },
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /home/featured-jobs — "Teaching Jobs" section on home page
exports.getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Post.findAll({
      where: { Status: "active" },
      order: [["Date", "DESC"]],
      limit: 6,
    });
    return res.status(200).json({ status: "success", data: jobs });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /home/top-teachers — "Highest Rated Teachers" section
exports.getTopTeachers = async (req, res) => {
  try {
    const data = await getTopRatedTeachers(6);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /home/testimonials — "What Schools Say About Us"
exports.getTestimonials = async (req, res) => {
  try {
    const data = await getTestimonials(20);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /home/analytics/personality — average Big5 trait scores across all teachers
exports.getPersonalityAnalytics = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      where: { Role: "teacher" },
      attributes: ["Big5_Scores"],
    });
    const totals = { classroom: 0, professional: 0, tech: 0, empathy: 0, leadership: 0, n: 0 };
    for (const t of teachers) {
      const s = t.Big5_Scores;
      if (!s) continue;
      totals.classroom    += Number(s.classroom    ?? 0);
      totals.professional += Number(s.professional ?? 0);
      totals.tech         += Number(s.tech         ?? 0);
      totals.empathy      += Number(s.empathy      ?? s.overall ?? 0);
      totals.leadership   += Number(s.leadership   ?? s.overall ?? 0);
      totals.n++;
    }
    const n = totals.n || 1;
    return res.status(200).json({
      status: "success",
      data: {
        radar: [
          Math.round(totals.classroom / n),
          Math.round(totals.professional / n),
          Math.round(totals.tech / n),
          Math.round(totals.empathy / n),
          Math.round(totals.leadership / n),
        ],
        sample_size: totals.n,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// POST /home/feedback — general platform testimonial from home page form
exports.addFeedback = async (req, res) => {
  try {
    const { name, rating, text } = req.body || {};
    if (!rating) return res.status(400).json({ status: "fail", message: "rating is required." });
    const review = await createTestimonial(name, rating, text);
    return res.status(201).json({ status: "success", data: review });
  } catch (err) {
    return res.status(400).json({ status: "fail", message: err.message });
  }
};
