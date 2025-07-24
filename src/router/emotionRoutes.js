const express = require("express");
const router = express.Router();
const emotionService = require("../router_handler/emotionService");

// 情感分析路由
router.post("/emotionmap/predict", emotionService.predict);

module.exports = router;
