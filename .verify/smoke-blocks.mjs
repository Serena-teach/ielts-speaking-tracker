// 校验「题目原文」已按 Part 2 / Part 3 分成两大块，并且界面渲染正确。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const bundle = fs.readFileSync(path.join(root, ".verify", "app.js"), "utf8");
const bank = fs.readFileSync(path.join(root, "public", "questions.json"), "utf8");
const parsed = JSON.parse(bank);

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
  window.fetch = async () => ({ ok: true, status: 200, json: async () => JSON.parse(bank) });
  window.eval(bundle);
  await wait(300);
  return window;
}

console.log("\n[数据层：全部 Part 2&3 分成两大块]");
const part23 = parsed.filter((q) => q.part === "Part 2&3");
const blocked = part23.filter(
  (q) => q.questions[0] === "【Part 2】" && q.questions.includes("【Part 3】")
);
check("60 道 Part 2&3 全部完成分块", blocked.length === part23.length, `${blocked.length}/${part23.length}`);
check(
  "Part 3 追问全部编号且去掉了 'Part 3:' 前缀",
  part23.every((q) => {
    const p3 = q.questions.slice(q.questions.indexOf("【Part 3】") + 1);
    return p3.length > 0 && p3.every((item, index) => item.startsWith(`${index + 1}. `));
  })
);
check(
  "Part 2 块保留卡片题与 You should say 要点",
  part23.every((q) => q.questions[1].startsWith("Describe") && q.questions[2].startsWith("You should say:"))
);
const part1 = parsed.filter((q) => q.part === "Part 1");
check("39 道 Part 1 保持逐小问原样", part1.length === 39 && part1.every((q) => !q.questions[0].startsWith("【")));
check(
  "每道题仍带 9 分答案与高级词语",
  parsed.every((q) => q.ninePointAnswer.trim().length > 0 && q.advancedWords.length > 0)
);

console.log("\n[界面：详情页 p23-important-decision]");
const detail = await launch("http://localhost/question/p23-important-decision");
const text = detail.document.body.textContent;
const boxes = [...detail.document.querySelectorAll("textarea")].map((el) => el.value);
check("渲染了【Part 2】分块标题", text.includes("【Part 2】"));
check("渲染了【Part 3】分块标题", text.includes("【Part 3】"));
check("分块标题不再被当作题目输入框", boxes.every((value) => !/^【Part [23]】$/.test(value.trim())));
check("题目行数量正确（Part 2 两行 + Part 3 六行，其余是标题/答案等文本框）", detail.document.querySelectorAll("textarea").length === 11, detail.document.querySelectorAll("textarea").length);
check("卡片题在编辑框里", boxes.some((value) => value.startsWith("Describe a time you made an important decision")));
check("You should say 要点合并成一行", boxes.some((value) => value.startsWith("You should say:") && value.includes(" / ")));
check("Part 3 追问带编号", boxes.some((value) => value.startsWith("1. Which is better")) && boxes.some((value) => value.startsWith("6. How can we tell")));
check("9 分答案不受影响", boxes.some((value) => value.includes("【Part 2 示范答案】") && value.includes("【Part 3 观点与表达】")));

console.log("\n[界面：列表预览不再显示分块标题]");
const listWindow = await launch("http://localhost/");
const previews = [...listWindow.document.querySelectorAll('a[href^="/question/"] p')].map((el) => el.textContent.trim());
check("列表条数仍为 99", previews.length === 99, previews.length);
check("没有以【开头的预览", previews.every((p) => !p.startsWith("【")), previews.find((p) => p.startsWith("【")));
check("Part 2&3 条目预览显示 Describe 题干", previews.some((p) => p.startsWith("Describe ")));

console.log(`\n通过 ${passed} 项，失败 ${failures.length} 项`);
if (failures.length) {
  console.log(failures.map((f) => " - " + f).join("\n"));
  process.exit(1);
}

