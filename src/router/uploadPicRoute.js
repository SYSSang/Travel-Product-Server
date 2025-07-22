const express = require("express");
const router = express.Router();
const uploadPicService = require("../router_handler/uploadPicService");
const auth = require("../middleware/auth");

router.post(
  "/image",
  auth,
  uploadPicService.upload.single("image"),
  uploadPicService.uploadPicHandler
);

module.exports = router;
