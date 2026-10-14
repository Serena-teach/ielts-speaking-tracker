// 用 esbuild 的 WASM 版本生成可直接托管的静态站点（沙箱里原生 esbuild 无法运行）。
// 用法：node .verify/build-static.mjs <项目目录> <输出目录>
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild-wasm";

const project = path.resolve(process.argv[2] ?? ".");
const outDir = path.resolve(process.argv[3] ?? path.join(project, "dist"));

const importMetaEnv = {
  name: "import-meta-env",
  setup(build) {
    build.onLoad({ filter: /src[\\/].*\.(ts|tsx)$/ }, async (args) => {
      const source = await fs.promises.readFile(args.path, "utf8");
      return {
        contents: source.replace(/import\.meta\.env\.BASE_URL/g, '"/"'),
        loader: args.path.endsWith(".tsx") ? "tsx" : "ts",
      };
    });
  },
};

await esbuild.initialize({ worker: false });

fs.mkdirSync(path.join(outDir, "assets"), { recursive: true });

const result = await esbuild.build({
  absWorkingDir: project,
  entryPoints: [path.join(project, "src", "main.tsx")],
  bundle: true,
  platform: "browser",
  format: "iife",
  target: "es2019",
  jsx: "automatic",
  minify: true,
  logLevel: "warning",
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [importMetaEnv],
  loader: { ".css": "text" },
  outfile: path.join(outDir, "assets", "app.js"),
});

fs.writeFileSync(
  path.join(outDir, "index.html"),
  `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>雅思口语题库练习记录</title>
    <link rel="stylesheet" href="/assets/index.css" />
  </head>
  <body>
    <div id="root"></div>
    <script src="/assets/app.js"></script>
  </body>
</html>
`,
  "utf8"
);

for (const file of ["questions.json", "questions-full.json"]) {
  fs.copyFileSync(path.join(project, "public", file), path.join(outDir, file));
}

console.log("静态构建完成:", outDir, "errors:", result.errors.length);
