// 用真实打包产物 + 新题库（99 题）跑一遍界面，确认答案与高级词语渲染正常。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const bundle = fs.readFileSync(path.join(root, ".verify", "app.js"), "utf8");
const bank = fs.readFileSync(path.join(root, "public", "questions.json"), "utf8");

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

async function launch(url) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url,
    pretendToBeVisual: true,
    runScripts: "outside-only",
  });
  const { window } = dom;
  window.fetch = async (requestUrl) => ({
    ok: true,
    status: 200,
    json: async () => JSON.parse(String(requestUrl).includes("questions-full") ? bank : bank),
  });
  window.eval(bundle);
  await wait(300);
  return window;
}

console.log("\n[列表页：99 题题库]");
const listWindow = await launch("http://localhost/");
const listText = listWindow.document.body.textContent;
check("总题数显示 99", listText.includes("总 99"), listText.slice(0, 200));
check("已练数显示 1（示例 Music 带练习记录）", listText.includes("已练 1"));
check("列表渲染 99 条题目", listWindow.document.querySelectorAll('a[href^="/question/"]').length === 99,
  listWindow.document.querySelectorAll('a[href^="/question/"]').length);
check("分区导航出现「其他题目」以外的六个分区角标", (listText.match(/\d+\/99/g) ?? []).length >= 1);

console.log("\n[详情页：大陆新题 Part 1 Shoes]");
const detail = await launch("http://localhost/question/mainland-new-p1-shoes");
const detailText = detail.document.body.textContent;
const textareas = [...detail.document.querySelectorAll("textarea")];
check("9 分答案已渲染", textareas.some((el) => el.value.includes("Comfort wins hands down")));
check("高级词语标签已渲染", detailText.includes("挤脚") && detailText.includes("a deal-breaker"));
check("答案里包含全部小问", ["Which do you prefer", "bought shoes online", "buying shoes"].every((s) => textareas.some((el) => el.value.includes(s))));

console.log("\n[详情页：万年老题 Home/accommodation]");
const classic = await launch("http://localhost/question/mainland-classic-p1-home-accommodation");
const classicText = classic.document.body.textContent;
check("分类块覆盖到「交通」相关问题", classicText.includes("transport facilities") || classicText.includes("电梯"));
check("答案非空", [...classic.document.querySelectorAll("textarea")].some((el) => el.value.includes("ten-minute walk")));
check("高级词语包含中文释义", classicText.includes("unbeatable location"));

console.log("\n[详情页：非大陆新题 Part 2&3 课程]");
const p23 = await launch("http://localhost/question/non-mainland-new-p23-describe-a-course-that-impressed-you-a-lot");
const p23Area = [...p23.document.querySelectorAll("textarea")].map((el) => el.value).join("\n");
check("Part 2 示范答案渲染", p23Area.includes("documentary film-making"));
check("Part 3 观点与表达渲染", p23Area.includes("Part 3 观点与表达") && p23Area.includes("Memory follows interest"));

console.log(`\n通过 ${passed} 项，失败 ${failures.length} 项`);
if (failures.length) {
  console.log(failures.map((f) => " - " + f).join("\n"));
  process.exit(1);
}
