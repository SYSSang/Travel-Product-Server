module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "127.0.0.1",
  },

  // 模型服务器配置
  model: {
    baseURL: {
      baseURL:
        process.env.MODELMODEL_BASE_URL ||
        "http://127.0.0.1:8000/multimodal/predict",
    },
  },

  // 高德地图API配置
  amap: {
    key: process.env.AMAP_KEY || "6ed1bcec67f3826625aaaa9294ece858", // 用户的高德地图API Key
    geocodeUrl: "https://restapi.amap.com/v3/geocode/geo",
  },
};
