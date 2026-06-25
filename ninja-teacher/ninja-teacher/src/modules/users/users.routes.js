const express = require("express");
const router  = express.Router();
const ctrl    = require("./users.controller");
const { protect }  = require("../../middlewares/auth.middleware");
const { upload }   = require("../../middlewares/upload.middleware");

router.use(protect);

router.get  ("/me",             ctrl.getMyProfile);
router.put  ("/me",             ctrl.updateAccountSettings);
router.put  ("/change-password",ctrl.changePassword);
router.put  ("/profile-photo",  upload.single("profileImage"), ctrl.updateProfilePhoto);
router.get  ("/:id",            ctrl.getUserById);

module.exports = router;