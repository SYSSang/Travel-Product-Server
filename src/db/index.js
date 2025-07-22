const mysql = require("mysql2/promise");
const config = require("../config/config");

// 创建数据库连接池
const db = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 数据库连接提示
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("数据库连接成功！");
    connection.release();
  } catch (err) {
    console.error("数据库连接失败", err);
  }
}
testConnection();

// 暴露数据库对象
module.exports = db;
