const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const articleService = require("../router_handler/articleService");

router.post("/publish", auth, articleService.publishArticleHandler);

module.exports = router;
