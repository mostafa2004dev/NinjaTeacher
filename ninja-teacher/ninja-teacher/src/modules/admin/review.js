const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// ── Review ───────────────────────────────────────────────────────────────────
// مدرسة (School) بتقيّم معلم (Teacher) بعد ما يخلصوا تعاون/match
// ملحوظة: Teacher و School نفس الموديل (Teacher) فرقهم Role فقط
const Review = sequelize.define("Review", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // بيتحسب أوتوماتيك في الـ service: rating <= 2 → critical
  is_critical: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "Reviews",
  timestamps: true,
});

module.exports = Review;

/* ─────────────────────────────────────────────────────────────────────────
   ASSOCIATIONS — ضيف السطور دي في ملف associations.js بتاعك (فين ما تكون):

   const Review  = require("./reviews/review.model");
   const Teacher = require("./users/users.model");

   Review.belongsTo(Teacher, { foreignKey: "teacher_id", as: "Teacher" });
   Review.belongsTo(Teacher, { foreignKey: "school_id",  as: "School"  });
   Teacher.hasMany(Review, { foreignKey: "teacher_id", as: "ReceivedReviews" });
   ───────────────────────────────────────────────────────────────────────── */