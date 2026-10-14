/**
 * 零依赖静态服务器：托管 dist/（或任意目录），并为 SPA 路由回退到 index.html。
 *
 * 用法：
 *   npm run serve                 # 托管 dist/，端口 5173
 *   node scripts/serve-static.mjs dist 5173
 *
 * 适用于「不想跑 Vite」或只想快速看一眼构建结果的场景。
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targetDir = path.resolve(projectRoot, process.argv[2] ?? "dist");
const port = Number(process.argv[3] ?? 5173);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

if (!fs.existsSync(path.join(targetDir, "index.html"))) {
  console.error(`找不到 ${path.join(targetDir, "index.html")}，请先执行 npm run build（或使用 npm run dev）。`);
  process.exit(1);
}

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent((request.url ?? "/").split("?")[0]);
  let filePath = path.join(targetDir, urlPath);

  // 防止越界访问
  if (!filePath.startsWith(targetDir)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  // 目录或不存在的路径：目录优先 index.html，其余回退到 SPA 入口
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(targetDir, "index.html");
  }

  try {
    const body = fs.readFileSync(filePath);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500).end(String(error));
  }
});

// 不指定 host：同时监听 IPv4 与 IPv6，避免浏览器先试 ::1 时连接失败
server.listen(port, () => {
  console.log(`雅思口语题库已在 http://localhost:${port}/ 运行（目录：${targetDir}）`);
  console.log("按 Ctrl + C 停止。");
});
