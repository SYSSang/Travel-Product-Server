const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const emotionService = require("../router_handler/emotionService");

// 情感分析路由
router.post("/emotionmap/predict", emotionService.predict);

// 存储情绪制作完成的数据
router.post("/store", auth, emotionService.storeEmotionData);

// 获取对应文章aid的存储的情绪数据
router.get("/:aid", emotionService.getEmotionData);

module.exports = router;
