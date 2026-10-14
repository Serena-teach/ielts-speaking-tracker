// 用 esbuild 的 WASM 版本打包应用（沙箱里原生的 esbuild.exe 无法读取上层目录）。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild-wasm";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

// 把 Vite 专有的 import.meta.env.BASE_URL 替换成 "/"，方便在纯 Node 环境里跑
const importMetaEnv = {
  name: "import-meta-env",
  setup(build) {
    build.onLoad({ filter: /src[\\/].*\.(ts|tsx)$/ }, async (args) => {
      const source = await fs.promises.readFile(args.path, "utf8");
      const contents = source.replace(/import\.meta\.env\.BASE_URL/g, '"/"');
      return { contents, loader: args.path.endsWith(".tsx") ? "tsx" : "ts" };
    });
  },
};

async function main() {
  await esbuild.initialize({ worker: false });

  const common = {
    absWorkingDir: root,
    bundle: true,
    platform: "browser",
    format: "iife",
    target: "es2020",
    jsx: "automatic",
    logLevel: "warning",
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [importMetaEnv],
    loader: { ".css": "text" },
  };

  const app = await esbuild.build({
    ...common,
    entryPoints: [path.join(root, "src", "main.tsx")],
    outfile: path.join(here, "app.js"),
    write: true,
  });
  if (app.errors.length) throw new Error("打包失败：" + JSON.stringify(app.errors));

  await esbuild.build({
    ...common,
    platform: "node",
    format: "esm",
    target: "esnext",
    entryPoints: [path.join(here, "logic.ts")],
    outfile: path.join(here, "logic.mjs"),
    external: ["node:*"],
  });

  console.log("打包完成");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

