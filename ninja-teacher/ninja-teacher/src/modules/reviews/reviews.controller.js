const reviewsService = require("./reviews.service");

exports.addReview = async (req, res) => {
  try {
    const review = await reviewsService.addReview(
      req.user.Teacher_ID, req.user.Name, req.body
    );
    return res.status(201).json({ status: "success", data: review });
  } catch (err) {
    const code = err.message.includes("already reviewed") ? 409 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.getTeacherReviews = async (req, res) => {
  try {
    const data = await reviewsService.getTeacherReviews(req.params.teacherId);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getTopRatedTeachers = async (req, res) => {
  try {
    const data = await reviewsService.getTopRatedTeachers(req.query.limit);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const result = await reviewsService.deleteReview(req.params.id);
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.getTestimonials = async (req, res) => {
  try {
    const data = await reviewsService.getTestimonials(req.query.limit);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
