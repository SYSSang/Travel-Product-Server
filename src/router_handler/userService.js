const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

// 用户注册处理函数
exports.registerHandler = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    // 检查用户名是否存在
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: 0,
        message: "用户名或邮箱已被注册",
      });
    }

    //密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 插入新用户
    const [result] = await db.query(
      `INSERT INTO users (username, email, password, role, status, registerTime) 
       VALUES (?, ?, ?, 'user', 1, CURDATE())`,
      [username, email, hashedPassword]
    );
    if (result.affectedRows === 1) {
      res.status(201).json({
        status: 1,
        message: "注册成功",
        data: { uid: result.insertId, username, email },
      });
    } else {
      res.status(500).json({ status: 0, message: "注册失败" });
    }
  } catch (error) {
    console.error("注册失败：", error);
    res.status(500).json({
      status: 0,
      message: "服务器错误",
    });
  }
};

// 用户登录路由
exports.loginHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    // 查询用户是否存在
    const [users] = await db.query(
      "SELECT * FROM users WHERE username = ? AND status = 1",
      [username]
    );
    if (users.length === 0) {
      return res.status(400).json({
        status: 0,
        message: "用户名或密码错误",
      });
    }

    const user = users[0];
    // 密码验证
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 0,
        message: "用户名或密码错误",
      });
    }

    // 生成token
    const token = jwt.sign(
      {
        uid: user.uid,
        username: user.username,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      status: 1,
      message: "登录成功",
      data: {
        token,
        user: {
          uid: user.uid,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("登录失败：", error);
    res.status(500).json({
      status: 0,
      message: "服务器错误",
    });
  }
};
