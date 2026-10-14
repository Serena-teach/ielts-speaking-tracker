// 纯 Node 静态服务器：托管静态构建产物，并为 SPA 路由回退到 index.html。
// 用法：node serve-static.mjs <目录> [端口]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const rootDir = path.resolve(process.argv[2] ?? ".");
const port = Number(process.argv[3] ?? 5173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let filePath = path.join(rootDir, urlPath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const indexCandidate = path.join(filePath, "index.html");
    filePath = fs.existsSync(indexCandidate) ? indexCandidate : path.join(rootDir, "index.html");
  }

  try {
    const body = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] ?? "application/octet-stream" });
    res.end(body);
  } catch (error) {
    res.writeHead(500).end(String(error));
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`静态服务器已启动: http://127.0.0.1:${port}/  (root: ${rootDir})`);
});
