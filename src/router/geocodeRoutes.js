const express = require("express");
const router = express.Router();
const geocodeService = require("../router_handler/geocodeService");
const auth = require("../middleware/auth");

// 地理编码单个
router.get("/locationinfo", auth, geocodeService.getLocation);

// 为地点情绪数据添加坐标
router.post(
  "/emotionmap/add-locations",
  auth,
  geocodeService.addLocationsToEmotionData
);

module.exports = router;
