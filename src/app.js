const express = require("express");
const config = require("./config/config");

const app = express();
const port = config.server.port;
const host = config.server.host;

// // 解决跨域
const cors = require("cors");
app.use(cors());

// 解析请求体 - urlencoded必须在json之前
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 登录注册路由
const userRoutes = require("./router/userRoutes");
app.use("/api/user", userRoutes);

// 上传图片
const uploadPicRoutes = require("./router/uploadPicRoute");
app.use("/api/upload", uploadPicRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    status: 0,
    message: "服务器内部错误",
  });
});

app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
