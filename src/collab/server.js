const http = require("http");
const { WebSocketServer } = require("ws");

const server = http.createServer((request, response) => {
  // 添加 CORS 头
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Yjs Collaborative Editing Server is running");
});

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ server });

// 处理 WebSocket 连接
wss.on("connection", (ws, request) => {
  console.log("新的 WebSocket 连接:", request.url);

  // 处理消息
  ws.on("message", (message) => {
    // 直接广播二进制消息，不做 JSON 解析
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });

  // 处理连接关闭
  ws.on("close", () => {
    console.log("WebSocket 连接已关闭");
  });

  // 处理错误
  ws.on("error", (error) => {
    console.error("WebSocket 错误:", error);
  });
});

// 启动服务器，监听 8080 端口
server.listen(8080, () => {
  console.log("Yjs 协同编辑 WebSocket 服务已启动，端口 8080");
});
