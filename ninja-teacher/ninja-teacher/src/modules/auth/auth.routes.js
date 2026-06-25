const express = require("express");
const router  = express.Router();
const ctrl    = require("./auth.controller");
const { protect } = require("../../middlewares/auth.middleware");

// Public
router.post("/register",       ctrl.register);
router.post("/login",          ctrl.login);
router.post("/forgot-password",ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetPassword);   // token comes from email link

// Protected — user must be logged in
router.post("/logout",          protect, ctrl.logout);
router.post("/change-password", protect, ctrl.changePassword);

router.post("/google", ctrl.googleAuth);

module.exports = router;
