require("dotenv").config();

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT,
    host: process.env.HOST,
  },

  // 数据库配置
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },

  // 模型服务器配置
  model: {
    baseURL: {
      baseURL: process.env.MODELMODEL_BASE_URL,
    },
  },

  // 高德地图API配置
  amap: {
    key: process.env.AMAP_KEY, // 用户的高德地图API Key
    geocodeUrl: "https://restapi.amap.com/v3/geocode/geo",
  },
};
