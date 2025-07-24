const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const articleService = require("../router_handler/articleService");

// 发布文章
router.post("/publish", auth, articleService.publishArticleHandler);

// 获取文章详情
router.get("/detail/:aid", articleService.getArticleDetail);

// 存储原始情绪数据
router.post("/store/emotion", articleService.storeOriginalEmotionData);

module.exports = router;
