const axios = require("axios");
const qs = require("querystring");

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
