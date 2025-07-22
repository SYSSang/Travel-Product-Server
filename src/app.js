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

app.get("/", (req, res) => {
  res.send({ status: 1, message: "Hello, World!", data: "1" });
});

const userRoutes = require("./router/userRoutes");
app.use("/api/user", userRoutes);

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
