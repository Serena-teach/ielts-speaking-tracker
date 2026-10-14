import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 纯前端项目：没有任何后端代理配置，dev/build 都只产出静态资源。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
