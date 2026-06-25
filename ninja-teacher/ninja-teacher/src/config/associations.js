// ═══════════════════════════════════════════════════════════════════
//  config/associations.js — علاقات الـ Models (أُعيدت كتابته بعد تلف RAR)
//  الـ aliases هنا مطابقة للمستخدم فعليًا في الـ services:
//   Subscription↔Plan ("Plan"), Subscription↔Teacher ("Teacher"),
//   Teacher↔Subscriptions ("Subscriptions"/"Subscription"),
//   Post↔Teacher كمدرسة ("School"), Application↔Teacher/Post
// ═══════════════════════════════════════════════════════════════════
function defineAssociations() {
  const Teacher          = require("../modules/users/users.model");
  const Post             = require("../modules/jobPosts/jobPosts.model");
  const AppliedJob       = require("../modules/appliedJobs/appliedJobs.model");
  const Notification     = require("../modules/notifications/notifications.model");
  const Subscription     = require("../modules/subscriptions/subscription.model");
  const SubscriptionPlan = require("../modules/subscriptions/subscriptionPlan.model");
  const Payment          = require("../modules/payments/payment.model");
  const Invoice          = require("../modules/payments/invoice.model");
  const Review           = require("../modules/reviews/reviews.model");

  // ── الوظائف: المدرسة (Teacher بدور school) تنشر Posts ──
  Teacher.hasMany(Post,   { foreignKey: "School_ID", sourceKey: "Teacher_ID", as: "Posts" });
  Post.belongsTo(Teacher, { foreignKey: "School_ID", targetKey: "Teacher_ID", as: "School" });

  // ── التقديمات ──
  Teacher.hasMany(AppliedJob,   { foreignKey: "Teacher_ID", sourceKey: "Teacher_ID", as: "Applications" });
  AppliedJob.belongsTo(Teacher, { foreignKey: "Teacher_ID", targetKey: "Teacher_ID", as: "Teacher" });

  // ── الإشعارات ──
  Teacher.hasMany(Notification,   { foreignKey: "Teacher_ID", sourceKey: "Teacher_ID", as: "Notifications" });
  Notification.belongsTo(Teacher, { foreignKey: "Teacher_ID", targetKey: "Teacher_ID" });

  // ── الاشتراكات ──
  SubscriptionPlan.hasMany(Subscription,   { foreignKey: "plan_id", as: "Subscriptions" });
  Subscription.belongsTo(SubscriptionPlan, { foreignKey: "plan_id", as: "Plan" });
  Teacher.hasMany(Subscription,            { foreignKey: "user_id", sourceKey: "Teacher_ID", as: "Subscriptions" });
  Teacher.hasOne(Subscription,             { foreignKey: "user_id", sourceKey: "Teacher_ID", as: "Subscription" });
  Subscription.belongsTo(Teacher,          { foreignKey: "user_id", targetKey: "Teacher_ID", as: "Teacher" });

  // ── المدفوعات والفواتير ──
  Teacher.hasMany(Payment,        { foreignKey: "user_id", sourceKey: "Teacher_ID", as: "Payments" });
  Payment.belongsTo(Teacher,      { foreignKey: "user_id", targetKey: "Teacher_ID", as: "Teacher" });
  Subscription.hasMany(Payment,   { foreignKey: "subscription_id", as: "Payments" });
  Payment.belongsTo(Subscription, { foreignKey: "subscription_id", as: "Subscription" });
  Payment.hasOne(Invoice,         { foreignKey: "payment_id", as: "Invoice" });
  Invoice.belongsTo(Payment,      { foreignKey: "payment_id", as: "Payment" });
  Teacher.hasMany(Invoice,        { foreignKey: "user_id", sourceKey: "Teacher_ID", as: "Invoices" });
  Invoice.belongsTo(Teacher,      { foreignKey: "user_id", targetKey: "Teacher_ID", as: "Teacher" });

  // ── التقييمات: المراجعة تخص معلم ──
  Teacher.hasMany(Review,   { foreignKey: "teacher_id", sourceKey: "Teacher_ID", as: "Reviews" });
  Review.belongsTo(Teacher, { foreignKey: "teacher_id", targetKey: "Teacher_ID", as: "Teacher" });

  console.log("✅ Associations defined");
}
module.exports = { defineAssociations };
