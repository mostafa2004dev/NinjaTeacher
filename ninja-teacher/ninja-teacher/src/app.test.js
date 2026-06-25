require("dotenv").config();
const express = require("express");
const http    = require("http");
const cors    = require("cors");
const path    = require("path");

const { sequelize }          = require("./config/database");
const { initSocket }         = require("./config/socket");
const { defineAssociations } = require("./config/associations");
const { seedPlans }          = require("./modules/subscriptions/plans.seeder");
const { seedAdmin }          = require("./modules/admin/admin.seeder");
const {
  expireStaleSubscriptions,
  expireStalePendingPayments,
} = require("./modules/subscriptions/subscription.service");

const authRoutes         = require("./modules/auth/auth.routes");
const userRoutes         = require("./modules/users/users.routes");
const profileRoutes      = require("./modules/profile/profile.routes");
const jobPostRoutes      = require("./modules/jobPosts/jobPosts.routes");
const appliedJobRoutes   = require("./modules/appliedJobs/appliedJobs.routes");
const notificationRoutes = require("./modules/notifications/notifications.routes");
const dashboardRoutes    = require("./modules/dashboard/dashboard.routes");
const subscriptionRoutes = require("./modules/subscriptions/subscription.routes");
const paymentRoutes      = require("./modules/payments/payment.routes");
const adminRoutes        = require("./modules/admin/admin.routes");
const reviewRoutes       = require("./modules/reviews/reviews.routes");
const messageRoutes      = require("./modules/messages/messages.routes");
const contactRoutes      = require("./modules/contact/contact.routes");
const homeRoutes         = require("./modules/home/home.routes");
const aiMatchingRoutes   = require("./modules/aiMatching/aiMatching.routes");
const schoolRoutes       = require("./modules/school/school.routes");
const assessmentRoutes   = require("./modules/assessment/assessment.routes");
const surveyRoutes       = require("./modules/survey/survey.routes");
const aiInsightsRoutes   = require("./modules/aiInsights/aiInsights.routes");

const app    = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/auth",           authRoutes);
app.use("/users",          userRoutes);
app.use("/profile",        profileRoutes);
app.use("/job-posts",      jobPostRoutes);
app.use("/applied-jobs",   appliedJobRoutes);
app.use("/notifications",  notificationRoutes);
app.use("/dashboard",      dashboardRoutes);
app.use("/subscriptions",  subscriptionRoutes);
app.use("/payments",       paymentRoutes);
app.use("/admin",          adminRoutes);
app.use("/reviews",        reviewRoutes);
app.use("/messages",       messageRoutes);
app.use("/contact",        contactRoutes);
app.use("/home",           homeRoutes);
app.use("/ai-matching",    aiMatchingRoutes);
app.use("/school",         schoolRoutes);
app.use("/assessment",     assessmentRoutes);
app.use("/survey",         surveyRoutes);
app.use(aiInsightsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Ninja Teacher API ✅", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({ status: "error", message: err.message || "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ status: "fail", message: `Route ${req.method} ${req.path} not found.` });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    defineAssociations();

    await sequelize.sync();
    console.log("✅ Models synced");

    await seedPlans();
    await seedAdmin();
    await expireStaleSubscriptions();
    await expireStalePendingPayments();

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 http://localhost:${PORT}`);
      console.log(`🔌 ws://localhost:${PORT}`);
    });

    setInterval(async () => {
      await expireStaleSubscriptions();
      await expireStalePendingPayments();
    }, 60 * 60 * 1000);

  } catch (error) {
    console.error("❌ Failed to start:", error.message);
    process.exit(1);
  }
}

startServer();