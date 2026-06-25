const express = require("express");
const router  = express.Router();
const ctrl    = require("./notifications.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);
router.get   ("/",           ctrl.getMyNotifications);
router.get   ("/unread-count", ctrl.getUnreadCount);
router.patch ("/read-all",   ctrl.markAllAsRead);
router.patch ("/:id/read",   ctrl.markAsRead);
router.delete("/:id",        ctrl.deleteNotification);

module.exports = router;
