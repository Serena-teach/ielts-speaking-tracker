// 用 jsdom 真正跑一遍打包后的应用，验证三个页面的渲染与交互。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

const bundle = fs.readFileSync(path.join(root, ".verify", "app.js"), "utf8");
const sample = fs.readFileSync(path.join(root, "public", "questions.json"), "utf8");
const fullBank = fs.readFileSync(path.join(root, "public", "questions-full.json"), "utf8");
const RECORDS_KEY = "ielts-speaking-tracker:records:v1";

let passed = 0;
const failures = [];
function check(label, condition, extra) {
  if (condition) {
    passed += 1;
    console.log(`  ok  ${label}`);
  } else {
    failures.push(label);
    console.log(`FAIL  ${label}`, extra === undefined ? "" : String(extra));
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function launch(url) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url,
    pretendToBeVisual: true,
    runScripts: "outside-only",
  });
  const { window } = dom;
  window.fetch = async (url) => ({
    ok: true,
    status: 200,
    json: async () => JSON.parse(String(url).includes("questions-full") ? fullBank : sample),
  });
  window.eval(bundle);
  await wait(250); // 等 fetch + React 首次渲染
  return window;
}

/** 设置受控输入的值（React 需要走原生 setter 才会收到变化） */
function typeInto(window, element, value) {
  const proto =
    element.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(element, value);
  element.dispatchEvent(new window.Event("input", { bubbles: true }));
}

function buttonByText(window, text) {
  return [...window.document.querySelectorAll("button")].find((el) => el.textContent.includes(text));
}

// =============== 1. 题目列表页 ===============
console.log("\n[题目列表页 /]");
const listWindow = await launch("http://localhost/");
const listText = listWindow.document.body.textContent;
check("渲染了标题", listText.includes("雅思口语题库"));
check(
  "左侧渲染了 7 个分区",
  [
    "大陆新题 Part 1",
    "大陆新题 Part 2&3",
    "大陆保留题 Part 1",
    "大陆万年老题 Part 1",
    "大陆保留题 Part 2&3",
    "非大陆新题 Part 1",
    "非大陆新题 Part 2&3",
  ].every((label) => listText.includes(label))
);
check("有「全部题目」入口", listText.includes("全部题目"));
const listItems = listWindow.document.querySelectorAll('a[href^="/question/"]');
check("默认全部题目：展示 5 道示例题", listItems.length === 5, listItems.length);
check("进度条显示总题数", listText.includes("总 5"), listText);
check("进度条显示已练数量（示例数据中 1 道练过）", listText.includes("已练 1"), "");
check("题目卡片显示练习次数", listText.includes("练习 3 次"));
check("状态筛选按钮齐全", ["全部", "未练", "练过", "熟练"].every((label) => buttonByText(listWindow, label)));

// 搜索
const search = listWindow.document.querySelector('input[placeholder^="搜索"]');
typeInto(listWindow, search, "music");
await wait(80);
check(
  "按标题搜索 music 只剩 1 条",
  listWindow.document.querySelectorAll('a[href^="/question/"]').length === 1,
  listWindow.document.querySelectorAll('a[href^="/question/"]').length
);
typeInto(listWindow, search, "音乐");
await wait(80);
check(
  "支持中文标题搜索",
  listWindow.document.querySelectorAll('a[href^="/question/"]').length === 1
);
typeInto(listWindow, search, "");
await wait(80);

// 状态筛选
buttonByText(listWindow, "熟练").click();
await wait(80);
check("筛选「熟练」后没有匹配题目", listWindow.document.body.textContent.includes("没有符合条件的题目"));
buttonByText(listWindow, "练过").click();
await wait(80);
check(
  "筛选「练过」后剩 1 条",
  listWindow.document.querySelectorAll('a[href^="/question/"]').length === 1
);

[...listWindow.document.querySelectorAll("button")].find((el) => el.textContent.trim() === "全部").click();
await wait(80);

// 切换分区（点左侧导航）
const navButton = [...listWindow.document.querySelectorAll("button")].find((el) =>
  el.textContent.includes("大陆保留题 Part 1")
);
navButton.click();
await wait(80);
check("切换到「大陆保留题 Part 1」分区", listWindow.document.body.textContent.includes("大陆保留题 Part 1 进度"));
check(
  "分区内只剩该分区的题目",
  listWindow.document.querySelectorAll('a[href^="/question/"]').length === 1,
  listWindow.document.querySelectorAll('a[href^="/question/"]').length
);

// =============== 2. 题目详情页 ===============
console.log("\n[题目详情页 /question/p1-music]");
const detailWindow = await launch("http://localhost/question/p1-music");
const detailText = detailWindow.document.body.textContent;
const textareas = [...detailWindow.document.querySelectorAll("textarea")];
check("渲染了 9 分答案内容", textareas.some((el) => el.value.includes("music is a big part of my daily routine")));
check("渲染了参考高级词语标签", detailText.includes("pick out a tune by ear"));
check("渲染了改进问题", textareas.some((el) => el.value.includes("语速偏快")));
check("渲染了练习次数", detailText.includes("3 次"));
check("渲染了状态切换按钮组", ["未练", "练过", "熟练"].every((label) => buttonByText(detailWindow, label)));
const lastPractice = [...detailWindow.document.querySelectorAll("dd")].map((el) => el.textContent.trim());
check("显示最后练习时间（本地时区格式化）", lastPractice.some((text) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(text)), lastPractice.join(" | "));

// 练习次数 +1
buttonByText(detailWindow, "练习次数 +1").click();
await wait(120);
const recordAfterPlus = JSON.parse(detailWindow.localStorage.getItem(RECORDS_KEY) ?? "{}")["p1-music"];
check("点击 +1 后界面更新为 4 次", detailWindow.document.body.textContent.includes("4 次"));
check("点击 +1 后写入 localStorage", recordAfterPlus?.practiceCount === 4, JSON.stringify(recordAfterPlus));
check("+1 会记录最后练习日期", typeof recordAfterPlus?.lastPracticeDate === "string");

// 状态切换
buttonByText(detailWindow, "熟练").click();
await wait(120);
check(
  "切换状态写入 localStorage",
  JSON.parse(detailWindow.localStorage.getItem(RECORDS_KEY) ?? "{}")["p1-music"]?.status === "familiar"
);

// 自动保存（防抖 500ms）
const thoughts = textareas.find((el) => el.placeholder.includes("关键词提纲"));
check("找到「我的思路」编辑框", Boolean(thoughts));
typeInto(detailWindow, thoughts, "关键词：地铁 / 便宜 / 准时");
await wait(900);
const recordAfterTyping = JSON.parse(detailWindow.localStorage.getItem(RECORDS_KEY) ?? "{}")["p1-music"];
check(
  "输入停 500ms 后自动保存到 localStorage",
  recordAfterTyping?.myThoughts === "关键词：地铁 / 便宜 / 准时",
  JSON.stringify(recordAfterTyping?.myThoughts)
);
check("保存后显示「已保存」提示", detailWindow.document.body.textContent.includes("已保存"));

// 题目原文编辑（多行）
const firstQuestionBox = textareas[0];
typeInto(detailWindow, firstQuestionBox, "Do you prefer sad or happy music, and why?");
await wait(900);
check(
  "题目原文修改后自动保存",
  JSON.parse(detailWindow.localStorage.getItem(RECORDS_KEY) ?? "{}")["p1-music"]?.questions?.[0] ===
    "Do you prefer sad or happy music, and why?"
);

// =============== 3. 设置页 ===============
console.log("\n[设置页 /settings]");
const settingsWindow = await launch("http://localhost/settings");
const settingsText = settingsWindow.document.body.textContent;
check("统计卡片渲染", ["总题数", "已练题数", "未练题数", "熟练题数"].every((label) => settingsText.includes(label)));
check("总题数为 5", settingsText.includes("5"));
check("导出按钮存在", Boolean(buttonByText(settingsWindow, "导出为 JSON 文件")));
check("导入区域存在", settingsText.includes("选择 JSON 文件") && settingsText.includes("导入粘贴的内容"));
// 一键导入内置完整题库
buttonByText(settingsWindow, "导入内置完整题库").click();
await wait(300);
check("一键导入内置完整题库成功", settingsWindow.document.body.textContent.includes("已导入内置完整题库"));
check("与示例题合并后总题数为 99", settingsWindow.document.body.textContent.includes("99"));
check(
  "内置题库进入 localStorage",
  JSON.parse(settingsWindow.localStorage.getItem("ielts-speaking-tracker:custom-questions:v1") ?? "[]").length === 94
);

check(
  "清空数据前会弹确认框",
  Boolean(buttonByText(settingsWindow, "清空所有数据"))
);
buttonByText(settingsWindow, "清空所有数据").click();
await wait(120);
check("确认弹窗已出现", settingsWindow.document.body.textContent.includes("确定要清空所有数据吗？"));
buttonByText(settingsWindow, "确认清空").click();
await wait(150);
check(
  "确认后清空 localStorage",
  settingsWindow.localStorage.getItem(RECORDS_KEY) === null ||
    Object.keys(JSON.parse(settingsWindow.localStorage.getItem(RECORDS_KEY) ?? "{}")).length === 0
);
check("清空后显示提示", settingsWindow.document.body.textContent.includes("已清空所有练习记录"));

console.log(`\n通过 ${passed} 项，失败 ${failures.length} 项`);
if (failures.length > 0) {
  console.log(failures.map((item) => " - " + item).join("\n"));
  process.exit(1);
}





