const db = require("../db");

// 发布文章处理函数
exports.publishArticleHandler = async (req, res) => {
  try {
    const { title, content, type, permission, cover, imagesUrl, mainCity } =
      req.body;

    // 从认证中间件获取用户信息
    const { uid, username } = req.user;
    // 存储到数据库中
    const [result] = await db.query(
      `INSERT INTO articles (
        title, content, publishTime, author, authorID, 
        type, state, permission, cover, imagesUrl, mainCity
      ) VALUES (?, ?, CURDATE(), ?, ?, ?, 1, ?, ?, ?, ?)`,
      [
        title,
        content,
        username,
        uid,
        type,
        permission,
        cover,
        imagesUrl,
        mainCity,
      ]
    );

    return res.status(201).json({
      status: 1,
      message: "发布文章成功",
      data: {
        aid: result.insertId,
      },
    });
  } catch (error) {
    console.error("发布文章失败：", error);
    return res.status(500).json({
      status: 0,
      message: "服务器错误",
    });
  }
};
