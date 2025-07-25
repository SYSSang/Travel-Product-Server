// const axios = require("axios");
// const config = require("../config/config");
// const { analysis } = require("../config/cloudinary");

// // 获取单个地点的地理信息
// exports.getLocationHandler = async (req, res) => {
//   const { address } = req.body;
//   try {
//     const response = await axios.get(config.amap.geocodeUrl, {
//       params: {
//         key: config.amap.key,
//         address: address,
//         output: "JSON",
//       },
//       timeout: 5000,
//     });

//     if (
//       response.data.status === "1" &&
//       response.data.geocodes &&
//       response.data.geocodes.length > 0
//     ) {
//       const location = response.data.geocodes[0].location; // 格式: "116.310003,39.991957"
//       const [lng, lat] = location.split(",").map(Number);
//       return {
//         lng: lng,
//         lat: lat,
//         formatted_address: response.data.geocodes[0].formatted_address,
//       };
//     } else {
//       console.warn(`未找到地址 "${address}" 的坐标信息`);
//       res.status(404).json({
//         status: 0,
//         message: `未找到地址 "${address}" 的坐标信息`,
//       });
//       return null;
//     }
//   } catch (error) {
//     console.error(`获取地址 "${address}" 坐标失败:`, error.message);
//     return null;
//   }
// };

const axios = require("axios");
const config = require("../config/config");

// 获取单个地点的地理坐标
exports.getLocation = async (req, res) => {
  console.log(req.query);
  console.log(req.body);

  const { address } = req.query;
  try {
    const response = await axios.get(config.amap.geocodeUrl, {
      params: {
        key: config.amap.key,
        address: address,
        output: "JSON",
      },
      timeout: 5000,
    });

    if (
      response.data.status === "1" &&
      response.data.geocodes &&
      response.data.geocodes.length > 0
    ) {
      const location = response.data.geocodes[0].location;
      const [lng, lat] = location.split(",").map(Number);
      console.log("获取成功");
      return res.json({
        status: 1,
        message: "坐标获取成功",
        data: {
          lng: lng,
          lat: lat,
          formatted_address: response.data.geocodes[0].formatted_address,
        },
      });
      //   return {
      //     lng: lng,
      //     lat: lat,
      //     formatted_address: response.data.geocodes[0].formatted_address,
      //   };
    } else {
      return res.json({
        status: 0,
        message: "未找到该地址的坐标信息",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: "坐标获取失败",
      error: error.message,
    });
  }
};

// 为地点情绪数据添加坐标
exports.addLocationsToEmotionData = async (req, res) => {
  console.log(req.body);
  try {
    const emotionData = req.body;
    // 验证输入数据
    if (
      !emotionData ||
      typeof emotionData !== "object" ||
      Object.keys(emotionData).length === 0
    ) {
      return res.status(400).json({
        status: 0,
        message: "请提供有效的地点情绪数据",
      });
    }

    // 验证数据结构
    const invalidLocations = [];
    Object.entries(emotionData).forEach(([location, emotions]) => {
      if (!emotions || typeof emotions !== "object") {
        invalidLocations.push(location);
        return;
      }

      // 检查是否至少包含一种情绪
      const emotionTypes = [
        "高兴",
        "愤怒",
        "悲伤",
        "中性",
        "恐惧",
        "惊讶",
        "厌恶",
      ];
      const hasEmotion = emotionTypes.some(
        (type) => emotions[type] !== undefined
      );

      if (!hasEmotion) {
        invalidLocations.push(location);
      }
    });

    if (invalidLocations.length > 0) {
      return res.status(400).json({
        status: 0,
        message: `以下地点缺少有效的情绪数据: ${invalidLocations.join(", ")}`,
      });
    }

    console.log("数据验证通过，开始为地点获取坐标...");

    // 调用地理编码服务获取坐标
    const result = await processEmotionLocations(emotionData);

    if (result.status === 1) {
      // 统计成功获取坐标的地点数量
      const successCount = Object.values(result.data).filter(
        (item) => item.location !== null
      ).length;
      const totalCount = Object.keys(result.data).length;

      res.json({
        status: 1,
        message: `坐标获取成功，${successCount}/${totalCount} 个地点获取到坐标`,
        data: result.data,
        statistics: {
          total: totalCount,
          success: successCount,
          failed: totalCount - successCount,
        },
      });
    } else {
      res.status(500).json({
        status: 0,
        message: "坐标获取失败",
        error: result.message,
      });
    }
  } catch (error) {
    console.error("处理地点情绪数据失败:", error);
    return res.status(500).json({
      status: 0,
      message: "服务器内部错误",
      error: error.message,
    });
  }
};

// 批量获取地点地标信息
const processEmotionLocations = async (emotionData) => {
  try {
    console.log("开始处理情绪地点数据:", Object.keys(emotionData));

    const result = {};
    const locations = Object.keys(emotionData);

    // 并发获取所有地点的坐标
    const locationPromises = locations.map(async (location) => {
      const coords = await getLocationTool(location);
      return { location, coords };
    });

    const locationResults = await Promise.all(locationPromises);

    // 组合情绪数据和坐标
    locationResults.forEach(({ location, coords }) => {
      if (coords) {
        result[location] = {
          ...emotionData[location],
          location: coords,
        };
      } else {
        // 如果获取不到坐标，仍然保留情绪数据
        result[location] = {
          ...emotionData[location],
          location: null,
        };
      }
    });

    console.log(
      "处理完成，成功获取坐标的地点数量:",
      Object.values(result).filter((item) => item.location !== null).length
    );

    return {
      status: 1,
      message: "地点坐标获取成功",
      data: result,
    };
  } catch (error) {
    console.error("处理情绪地点数据失败:", error);
    return {
      status: 0,
      message: "地点坐标获取失败",
      error: error.message,
    };
  }
};

// 获取单个地点的地理坐标
async function getLocationTool(address) {
  try {
    const response = await axios.get(config.amap.geocodeUrl, {
      params: {
        key: config.amap.key,
        address: address,
        output: "JSON",
      },
      timeout: 5000,
    });

    if (
      response.data.status === "1" &&
      response.data.geocodes &&
      response.data.geocodes.length > 0
    ) {
      const location = response.data.geocodes[0].location; // 格式: "116.310003,39.991957"
      const [lng, lat] = location.split(",").map(Number);
      return {
        lng: lng,
        lat: lat,
        formatted_address: response.data.geocodes[0].formatted_address,
      };
    } else {
      console.warn(`未找到地址 "${address}" 的坐标信息`);
      return null;
    }
  } catch (error) {
    console.error(`获取地址 "${address}" 坐标失败:`, error.message);
    return null;
  }
}
