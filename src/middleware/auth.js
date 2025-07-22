const jwt = require("jsonwebtoken");
const config = require("../config/config");

// 验证 token 的中间件
const auth = (req, res, next) => {
  // 获取请求头中的 token
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      status: 0,
      message: "未提供认证令牌",
    });
  }

  try {
    // 验证 token
    const decoded = jwt.verify(token, config.jwt.secret);
    // 将用户信息添加到请求对象中
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 0,
      message: "无效的认证令牌",
    });
  }
};

module.exports = auth;
