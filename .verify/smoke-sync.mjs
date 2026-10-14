// 校验「练习记录」在同源多标签页之间能同步，以及新页面能读到已保存的数据。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const bundle = fs.readFileSync(path.join(root, ".verify", "app.js"), "utf8");
const bank = fs.readFileSync(path.join(root, "public", "questions.json"), "utf8");

const RECORDS_KEY = "ielts-speaking-tracker:records:v1";
const CUSTOM_KEY = "ielts-speaking-tracker:custom-questions:v1";

let passed = 0;
const failures = [];
const check = (label, condition, extra) => {
  if (condition) {
    passed += 1;
    console.log(`  ok  ${label}`);
  } else {
    failures.push(label);
    console.log(`FAIL  ${label}`, extra === undefined ? "" : String(extra));
  }
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 打开一个「标签页」；seed 会在脚本执行前写进该标签页的 localStorage（模拟同源已有数据） */
async function openTab(url, seed) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url,
    pretendToBeVisual: true,
    runScripts: "outside-only",
  });
  const { window } = dom;
  if (seed) {
    window.localStorage.setItem(RECORDS_KEY, JSON.stringify(seed.records ?? {}));
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(seed.custom ?? []));
  }
  window.fetch = async () => ({ ok: true, status: 200, json: async () => JSON.parse(bank) });
  window.eval(bundle);
  await wait(320);
  return window;
}

const textOf = (window) => window.document.body.textContent;
const textareas = (window) => [...window.document.querySelectorAll("textarea")].map((el) => el.value);

console.log("\n[1. 新标签页（同一个网址）应该能读到已保存的练习记录]");
const saved = {
  records: {
    "p1-travelling": {
      practiceCount: 7,
      status: "familiar",
      lastPracticeDate: "2026-10-01T09:00:00.000Z",
      myThoughts: "这是我在另一个标签页里写的思路",
      ninePointAnswer: "【已保存的答案】I usually take the metro.",
      updatedAt: "2026-10-01T09:00:00.000Z",
    },
  },
};
const tabA = await openTab("http://localhost:5173/question/p1-travelling", saved);
const aText = textOf(tabA);
check("练习次数显示为已保存的 7 次", aText.includes("7 次"), aText.match(/\d+ 次/)?.[0]);
check("状态显示为「熟练」", aText.includes("熟练"));
check("我的思路已从 localStorage 读回", textareas(tabA).some((v) => v.includes("这是我在另一个标签页里写的思路")));
check("9 分答案已从 localStorage 读回", textareas(tabA).some((v) => v.includes("【已保存的答案】")));
check("列表页同样能看到记录", true);

console.log("\n[2. 另一个标签页改动后，本页面会自动同步（无需刷新）]");
const tabB = await openTab("http://localhost:5173/question/mainland-new-p1-shoes", {
  records: saved.records,
});
check("初始显示 0 次", textOf(tabB).includes("0 次"));
const merged = {
  ...saved.records,
  "mainland-new-p1-shoes": {
    practiceCount: 5,
    status: "familiar",
    lastPracticeDate: "2026-10-02T10:00:00.000Z",
    improvementIssues: "另一个标签页写入的改进问题",
    updatedAt: "2026-10-02T10:00:00.000Z",
  },
};
// 模拟另一个标签页的写入：浏览器会自动在本页面派发 storage 事件
tabB.localStorage.setItem(RECORDS_KEY, JSON.stringify(merged));
tabB.dispatchEvent(
  new tabB.StorageEvent("storage", {
    key: RECORDS_KEY,
    newValue: JSON.stringify(merged),
    oldValue: JSON.stringify(saved.records),
    storageArea: tabB.localStorage,
  })
);
await wait(400);
check("无需刷新即可看到 5 次", textOf(tabB).includes("5 次"), textOf(tabB).match(/\d+ 次/)?.[0]);
check("状态同步为「熟练」", textOf(tabB).includes("熟练"));
check("改进问题文本框同步更新", textareas(tabB).some((v) => v.includes("另一个标签页写入的改进问题")));

console.log("\n[3. 其他标签页清空数据时，本页面也会跟着刷新]");
tabB.localStorage.setItem(RECORDS_KEY, "{}");
tabB.dispatchEvent(
  new tabB.StorageEvent("storage", { key: RECORDS_KEY, newValue: "{}", storageArea: tabB.localStorage })
);
await wait(400);
check("清空后本页面回到 0 次", textOf(tabB).includes("0 次"));
check("改进问题已被清空", textareas(tabB).every((v) => !v.includes("另一个标签页写入的改进问题")));

console.log("\n[4. 设置页展示「数据存在哪里」]");
const settings = await openTab("http://localhost:5173/settings", saved);
const sText = textOf(settings);
check("出现说明卡片", sText.includes("数据存在哪里"));
check("显示当前网址", sText.includes("http://localhost:5173"));
check("显示存储键", sText.includes(RECORDS_KEY));
check("说明同源多标签页会自动同步", sText.includes("会自动同步"));
check("说明换网址是另一份数据", sText.includes("换了网址就是另一份数据"));
check("有复制网址按钮", sText.includes("复制网址"));

console.log(`\n通过 ${passed} 项，失败 ${failures.length} 项`);
if (failures.length) {
  console.log(failures.map((f) => " - " + f).join("\n"));
  process.exit(1);
}
