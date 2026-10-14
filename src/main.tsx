import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("找不到 #root 节点，请检查 index.html");
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
