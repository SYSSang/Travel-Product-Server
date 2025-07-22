const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const path = require("path");

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只接受图片文件
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传图片文件！"), false);
  }
};

// 创建 multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制 5MB
  },
});

// 上传图片处理函数
exports.uploadPicHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 0,
        message: "请选择要上传的图片",
      });
    }

    // 上传到 Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "travel_product", // 在 Cloudinary 中创建的文件夹
      resource_type: "auto",
    });

    res.json({
      status: 1,
      message: "上传成功",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    console.error("上传失败：", error);
    res.status(500).json({
      status: 0,
      message: "上传失败",
    });
  }
};

// 导出 multer 中间件
exports.upload = upload;
