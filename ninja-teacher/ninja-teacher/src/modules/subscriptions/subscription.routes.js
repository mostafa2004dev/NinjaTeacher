// subscription.routes.js — أُعيدت كتابته بعد تلف RAR، مطابقة لدوال controller
const express = require("express");
const router  = express.Router();
const ctrl    = require("./subscription.controller");
const { protect } = require("../../middlewares/auth.middleware");

// عامة — عرض الخطط
router.get("/plans",     ctrl.getPlans);
router.get("/plans/all", ctrl.getAllPlans);

// محمية — تخص المستخدم الحالي
router.use(protect);
router.get ("/my",       ctrl.getMySubscription);
router.get ("/history",  ctrl.getSubscriptionHistory);
router.post("/",         ctrl.createSubscription);
router.post("/upgrade",  ctrl.upgradeSubscription);
router.post("/renew",    ctrl.renewSubscription);
router.post("/cancel",   ctrl.cancelSubscription);

module.exports = router;
