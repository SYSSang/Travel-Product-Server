const express = require("express");
const router = express.Router();
const userService = require("../router_handler/userService");

// 用户注册路由
router.post("/register", userService.registerHandler);

// 用户登录路由
router.post("/login", userService.loginHandler);

module.exports = router;
