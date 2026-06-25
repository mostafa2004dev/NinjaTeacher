const express = require("express");
const router  = express.Router();
const ctrl    = require("./messages.controller");
const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);
router.get   ("/",             ctrl.getMyMessages);
router.get   ("/sent",         ctrl.getSentMessages);
router.get   ("/unread-count", ctrl.getUnreadCount);
router.post  ("/",             ctrl.sendMessage);
router.patch ("/:id/read",     ctrl.markRead);
router.delete("/:id",          ctrl.deleteMessage);

module.exports = router;
