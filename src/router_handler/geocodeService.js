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
