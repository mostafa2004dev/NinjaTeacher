// reviews.service.js — أُعيدت كتابته بعد تلف RAR، متوافق مع reviews.controller
const Review  = require("./reviews.model");
const Teacher = require("../users/users.model");
const { sequelize } = require("../../config/database");

// إضافة مراجعة (مدرسة تقيّم معلم)
async function addReview(reviewerId, reviewerName, body) {
  const { teacher_id, rating, comment, job_title, job_id } = body || {};
  if (!teacher_id || rating == null) throw new Error("teacher_id and rating are required.");
  const r = parseFloat(rating);
  if (Number.isNaN(r) || r < 1 || r > 5) throw new Error("rating must be between 1 and 5.");

  const teacher = await Teacher.findByPk(teacher_id);
  if (!teacher) throw new Error("Teacher not found.");

  const existing = await Review.findOne({
    where: { reviewer_id: reviewerId, teacher_id, ...(job_id ? { job_id } : {}) },
  });
  if (existing) throw new Error("You have already reviewed this teacher.");

  const review = await Review.create({
    reviewer_id: reviewerId, reviewer_name: reviewerName, reviewer_type: "school",
    teacher_id, rating: r, comment: comment || null,
    job_title: job_title || null, job_id: job_id || null,
  });

  // حدّث متوسط تقييم المعلم
  const avg = await Review.findOne({
    where: { teacher_id, is_visible: true },
    attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "avg"]],
    raw: true,
  });
  if (avg && avg.avg != null && teacher.Average_Rating !== undefined) {
    await teacher.update({ Average_Rating: parseFloat(parseFloat(avg.avg).toFixed(1)) });
  }
  return review;
}

async function getTeacherReviews(teacherId) {
  return Review.findAll({
    where: { teacher_id: teacherId, is_visible: true },
    order: [["createdAt", "DESC"]],
  });
}

// أعلى المعلمين تقييمًا (للصفحة الرئيسية)
async function getTopRatedTeachers(limit = 6) {
  const rows = await Review.findAll({
    where: { is_visible: true },
    attributes: [
      "teacher_id",
      [sequelize.fn("AVG", sequelize.col("rating")), "avg_rating"],
      [sequelize.fn("COUNT", sequelize.col("Review.id")), "reviews_count"],
    ],
    group: ["teacher_id"],
    order: [[sequelize.literal("avg_rating"), "DESC"]],
    limit: parseInt(limit, 10) || 6,
    raw: true,
  });
  const out = [];
  for (const row of rows) {
    const t = await Teacher.findByPk(row.teacher_id, {
      attributes: ["Teacher_ID", "Name", "Image", "Specialization", "Location", "Role"],
    });
    if (t && t.Role !== "school") {
      out.push({ teacher: t, avg_rating: parseFloat(parseFloat(row.avg_rating).toFixed(1)),
                 reviews_count: parseInt(row.reviews_count, 10) });
    }
  }
  return out;
}

// شهادات للصفحة الرئيسية "What Schools Say About Us"
async function getTestimonials(limit = 6) {
  return Review.findAll({
    where: { is_visible: true, teacher_id: null },
    order: [["rating", "DESC"], ["createdAt", "DESC"]],
    limit: parseInt(limit, 10) || 6,
  });
}

// General platform testimonial — not tied to a specific teacher (home page form)
async function createTestimonial(reviewerName, rating, comment) {
  const r = parseFloat(rating);
  if (Number.isNaN(r) || r < 1 || r > 5) throw new Error("rating must be between 1 and 5.");
  const review = await Review.create({
    reviewer_id:   0,
    reviewer_name: reviewerName || "Anonymous",
    reviewer_type: "school",
    teacher_id:    null,
    rating:        r,
    comment:       comment || null,
    is_visible:    true,
  });
  return review;
}

async function deleteReview(id) {
  const review = await Review.findByPk(parseInt(id, 10));
  if (!review) throw new Error("Review not found.");
  await review.update({ is_visible: false });
  return { message: "Review hidden successfully." };
}

module.exports = { addReview, getTeacherReviews, getTopRatedTeachers, getTestimonials, createTestimonial, deleteReview };
