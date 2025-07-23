const express = require("express");
const router = express.Router();
const geocodeService = require("../router_handler/geocodeService");
const auth = require("../middleware/auth");

// 地理编码测试路由
router.get("/locationinfo", auth, geocodeService.getLocation);

module.exports = router;
