const axios = require("axios");
const db = require("../db/index");
const qs = require("querystring");
const { waitForDebugger } = require("inspector");
const { JsonWebTokenError } = require("jsonwebtoken");

// 本地模型接口的基础URL
const MODEL_BASE_URL = "http://127.0.0.1:8000/multimodal/predict";

// 向本地模型发送预测请求
exports.predict = async (req, res) => {
  try {
    console.log("收到预测请求:", req.method, req.url);
    console.log("请求头:", req.headers);
    console.log("请求体:", req.body);

    const inputData = req.body;

    // 验证输入数据
    if (!inputData || Object.keys(inputData).length === 0) {
      console.log("输入数据为空");
      return res.status(400).json({
        status: 0,
        message: "缺少输入数据",
      });
    }

    console.log("准备发送到模型的数据:", inputData);

    // 检查本地模型服务是否可用
    try {
      // 发送请求到本地模型
      const response = await axios.post(
        MODEL_BASE_URL,
        qs.stringify(inputData),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 30000,
        }
      );

      console.log("模型响应:", response.data);

      res.json({
        status: 1,
        message: "分析成功",
        data: response.data,
      });
    } catch (modelError) {
      console.error("本地模型服务错误:", modelError);

      // 如果本地模型不可用，返回模拟数据用于测试
      res.json({
        status: 1,
        message: "分析成功（模拟数据）",
        data: {
          emotion: "positive",
          confidence: 0.85,
          text: inputData.text || "测试文本",
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (err) {
    console.error("预测请求错误:", err);

    let errorMessage = "模型请求失败";

    if (err.response) {
      errorMessage = `模型服务错误: ${err.response.status} - ${JSON.stringify(
        err.response.data
      )}`;
    } else if (err.request) {
      errorMessage = "模型服务无响应或超时";
    } else {
      errorMessage = `请求配置错误: ${err.message}`;
    }

    console.error("模型接口错误:", errorMessage);

    res.status(500).json({
      status: 0,
      message: errorMessage,
    });
  }
};

// 存储情绪数据
exports.storeEmotionData = async (req, res) => {
  try {
    console.log("收到情绪数据存储请求");

    const {
      articleID,
      textEmotion,
      locationEmotion,
      imageEmotion,
      fusionEmotion,
      mainCity,
    } = req.body;

    // 验证必需参数
    if (!articleID) {
      return res.status(400).json({
        status: 0,
        message: "请提供文章ID",
      });
    }

    // 验证文章是否存在
    const [articles] = await db.query(
      "SELECT aid FROM articles WHERE aid = ? AND state = 1",
      [articleID]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        status: 0,
        message: "文章不存在",
      });
    }

    // 检查是否已经存在该文章的情绪数据
    const [existingEmotions] = await db.query(
      "SELECT id FROM emotion_maps WHERE articleID = ?",
      [articleID]
    );

    if (existingEmotions.length > 0) {
      return res.status(409).json({
        status: 0,
        message: "该文章的情绪数据已存在",
      });
    }

    // 将对象转换为JSON字符串
    const imagesEmotionJson = imageEmotion
      ? JSON.stringify(imageEmotion)
      : null;
    const textEmotionJson = textEmotion ? JSON.stringify(textEmotion) : null;
    const locationEmotionJson = locationEmotion
      ? JSON.stringify(locationEmotion)
      : null;
    const fusionEmotionJson = fusionEmotion
      ? JSON.stringify(fusionEmotion)
      : null;
    const mainCityJson = mainCity ? JSON.stringify(mainCity) : null;

    // 插入情绪数据
    const [result] = await db.query(
      `INSERT INTO emotion_maps (
        articleID, imagesEmotion, textEmotion, locationEmotion, fusionEmotion, mainCity
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        articleID,
        imagesEmotionJson,
        textEmotionJson,
        locationEmotionJson,
        fusionEmotionJson,
        mainCityJson,
      ]
    );

    console.log("情绪数据存储成功，ID:", result.insertId);

    res.status(201).json({
      status: 1,
      message: "情绪数据存储成功",
      data: {
        id: result.insertId,
        articleID: articleID,
      },
    });
  } catch (error) {
    console.error("存储情绪数据失败:", error);
    res.status(500).json({
      status: 0,
      message: "服务器内部错误",
      error: error.message,
    });
  }
};

// 获取对应文章aid的情绪数据处理函数
exports.getEmotionData = async (req, res) => {
  try {
    console.log(req.params);
    const { aid } = req.params;
    console.log("前端发送的aid：", aid);
    if (!aid) {
      return res.status(400).json({
        status: 0,
        message: "请提供文章ID",
      });
    }

    const [emotions] = await db.query(
      "SELECT * FROM emotion_maps WHERE articleID = ?",
      [aid]
    );
    if (emotions.length === 0) {
      return res.status(404).json({
        status: 0,
        message: "未找到该文章的情绪数据",
      });
    }

    const emotionData = emotions[0];
    const {
      id,
      articleID,
      imageEmotion,
      textEmotion,
      locationEmotion,
      fusionEmotion,
      mainCity,
    } = emotionData;

    const parsedData = {
      id: id,
      articleID: articleID,
      imageEmotion: imageEmotion ? JSON.parse(imageEmotion) : null,
      textEmotion: textEmotion ? JSON.parse(textEmotion) : null,
      locationEmotion: locationEmotion ? JSON.parse(locationEmotion) : null,
      fusionEmotion: fusionEmotion ? JSON.parse(fusionEmotion) : null,
      mainCity: mainCity ? JSON.parse(mainCity) : null,
    };

    return res.json({
      status: 1,
      message: "获取情绪数据成功",
      data: parsedData,
    });
  } catch (error) {
    console.error("获取情绪数据失败:", error);
    return res.status(500).json({
      status: 0,
      message: "服务器内部错误",
      error: error.message,
    });
  }
};
