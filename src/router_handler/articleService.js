const db = require("../db");
const { route } = require("../router/userRoutes");

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

// 根据aid查询文章信息get
exports.getArticleDetail = async (req, res) => {
  try {
    const { aid } = req.params;

    const [articles] = await db.query(
      "SELECT * FROM articles WHERE aid = ? AND state = 1",
      [aid]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        status: 0,
        message: "文章不存在",
      });
    }

    res.json({
      status: 1,
      message: "获取文章详情成功",
      data: articles[0],
    });
  } catch (error) {
    console.error("获取文章详情失败：", error);
    res.status(500).json({
      status: 0,
      message: "服务器错误",
    });
  }
};

// 存储原始情绪分析数据到活动
exports.storeOriginalEmotionData = async (req, res) => {
  console.log(req.body);
  const { aid, originalEmotionData } = req.body;
  console.log("数据类型：", typeof originalEmotionData); // 应该是 string

  try {
    // 先检查该 aid 是否存在
    const [rows] = await db.query(`SELECT aid FROM articles WHERE aid = ?`, [
      aid,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 0,
        message: "未找到对应的文章",
      });
    }

    // 更新 originalEmotionData 字段
    await db.query(
      `UPDATE articles SET originalEmotionData = ? WHERE aid = ?`,
      [originalEmotionData, aid]
    );

    return res.status(200).json({
      status: 1,
      message: "原始情绪数据存储成功",
      data: { aid },
    });
  } catch (err) {
    console.error("存储原始情绪失败：", err);
    return res.status(500).json({
      status: 0,
      message: "服务器错误",
    });
  }
};
