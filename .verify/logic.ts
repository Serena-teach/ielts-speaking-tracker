/**
 * 纯逻辑冒烟测试：不需要浏览器，只验证 store 的合并 / 导入 / 导出 / 清空等核心逻辑。
 * 运行：node .verify/logic.mjs
 */
import fs from "node:fs";
import path from "node:path";

let passed = 0;
const failures: string[] = [];

function check(label: string, condition: boolean, extra?: unknown) {
  if (condition) {
    passed += 1;
    console.log(`  ok  ${label}`);
  } else {
    failures.push(label);
    console.log(`FAIL  ${label}`, extra === undefined ? "" : JSON.stringify(extra));
  }
}

// --- 用内存 Map 模拟 localStorage -------------------------------------------
const memory = new Map<string, string>();
const fakeWindow = {
  localStorage: {
    getItem: (key: string) => (memory.has(key) ? (memory.get(key) as string) : null),
    setItem: (key: string, value: string) => void memory.set(key, String(value)),
    removeItem: (key: string) => void memory.delete(key),
  },
};
(globalThis as unknown as { window: unknown }).window = fakeWindow;

const root = process.cwd();
const sample = JSON.parse(fs.readFileSync(path.join(root, "public", "questions.json"), "utf8"));
const full = JSON.parse(fs.readFileSync(path.join(root, "public", "questions-full.json"), "utf8"));

let requested: string[] = [];
(globalThis as unknown as { fetch: unknown }).fetch = async (url: string) => {
  requested.push(url);
  return { ok: true, status: 200, json: async () => sample };
};

const RECORDS_KEY = "ielts-speaking-tracker:records:v1";
const CUSTOM_KEY = "ielts-speaking-tracker:custom-questions:v1";

const { useQuestionStore } = await import("../src/store/useQuestionStore");
const store = useQuestionStore;

await store.getState().load();
const loaded = store.getState();
check("加载 questions.json", loaded.questions.length === 5, loaded.questions.length);
check("请求路径带上 BASE_URL", requested[0] === "/questions.json", requested[0]);
check("加载后无错误", loaded.error === null, loaded.error);
check(
  "示例题覆盖 5 个分区",
  new Set(loaded.questions.map((q) => `${q.region}-${q.category}-${q.part}`)).size === 5
);
check(
  "示例数据里的练习状态被保留",
  loaded.questions.find((q) => q.id === "p1-music")?.practiceCount === 3
);

// --- 编辑保存 ---------------------------------------------------------------
store.getState().updateQuestion("p1-travelling", { ninePointAnswer: "I usually take the metro." });
const afterEdit = store.getState().questions.find((q) => q.id === "p1-travelling");
check("编辑后内存里的题目已更新", afterEdit?.ninePointAnswer === "I usually take the metro.");
const recordsRaw = JSON.parse(memory.get(RECORDS_KEY) ?? "{}");
check("编辑后写入 localStorage", recordsRaw["p1-travelling"]?.ninePointAnswer === "I usually take the metro.");
check("记录里带 updatedAt", typeof recordsRaw["p1-travelling"]?.updatedAt === "string");

// --- 练习次数 +1 ------------------------------------------------------------
store.getState().incrementPractice("p1-travelling");
const afterPlus = store.getState().questions.find((q) => q.id === "p1-travelling");
check("练习次数 +1", afterPlus?.practiceCount === 1, afterPlus?.practiceCount);
check("最后练习日期自动记录", typeof afterPlus?.lastPracticeDate === "string" && afterPlus.lastPracticeDate.length > 10);
check("首次练习自动升级为「练过」", afterPlus?.status === "practiced", afterPlus?.status);

store.getState().incrementPractice("p1-travelling");
check(
  "再次 +1 时状态不会被改动",
  store.getState().questions.find((q) => q.id === "p1-travelling")?.practiceCount === 2
);

store.getState().setStatus("p1-travelling", "familiar");
check("手动切换状态", store.getState().questions.find((q) => q.id === "p1-travelling")?.status === "familiar");

// --- 导入完整题库 -----------------------------------------------------------
const first = store.getState().importPayload(full);
check("导入完整题库：与 5 道示例题合并，新增 94 道", first.added === 94 && first.updated === 5 && first.skipped === 0, first);
check("导入后题目总数 99（示例题与题库合并，无重复）", store.getState().questions.length === 99, store.getState().questions.length);
check(
  "已导入的题目被记录到 localStorage",
  JSON.parse(memory.get(CUSTOM_KEY) ?? "[]").length === 94
);
check(
  "导入不会覆盖已有练习记录",
  store.getState().questions.find((q) => q.id === "p1-travelling")?.ninePointAnswer === "I usually take the metro."
);

check(
  "导入题库后不会出现重复题目（同分区 + 同标题只保留一条）",
  store.getState().questions.filter(
    (q) => q.region === "mainland" && q.category === "new" && q.part === "Part 1" && q.title === "Travelling"
  ).length === 1
);
check(
  "合并时沿用示例题原有的 id",
  Boolean(store.getState().questions.find((q) => q.id === "p1-travelling"))
);
const second = store.getState().importPayload(full);
check("重复导入是幂等的（不重复新增）", second.added === 0 && second.updated === 99, second);
check("重复导入后总数仍是 99", store.getState().questions.length === 99);

const backup = store.getState().buildExportPayload();
check("导出包含全部题目", backup.questions.length === 99);
check("导出统计里的已练数", backup.stats.practiced === 2, backup.stats);

// 清空后再用备份恢复
store.getState().clearAll();
check("清空后回到题库原始状态", store.getState().questions.length === 5, store.getState().questions.length);
check("清空后记录为空", JSON.parse(memory.get(RECORDS_KEY) ?? "{}") !== null && Object.keys(JSON.parse(memory.get(RECORDS_KEY) ?? "{}")).length === 0);

const restored = store.getState().importPayload(backup);
check("导入自己的备份文件可恢复", restored.added === 94 && restored.updated === 5, restored);
check(
  "恢复后练习记录回来了",
  store.getState().questions.find((q) => q.id === "p1-travelling")?.practiceCount === 2 &&
    store.getState().questions.find((q) => q.id === "p1-travelling")?.status === "familiar"
);

// --- 脏数据处理 -------------------------------------------------------------
const dirty = store.getState().importPayload([
  { title: "No id topic", questions: ["Do you like it?"] },
  { id: "weird", title: "Weird", part: "Part 2", practiceCount: -3, status: "unknown" },
  null,
  "not an object",
]);
check("缺 id 的题目用自动生成的 id 导入", dirty.added === 2, dirty);
check("非法条目被跳过", dirty.skipped === 2, dirty);
const weird = store.getState().questions.find((q) => q.id === "weird");
check("part 'Part 2' 归一化为 'Part 2&3'", weird?.part === "Part 2&3", weird?.part);
check("负数练习次数归零", weird?.practiceCount === 0);
check("非法状态归一化为未练", weird?.status === "not-practiced");
check(
  "region/category 缺失时给默认值",
  weird?.region === "mainland" && weird?.category === "new"
);

const noResult = store.getState().importPayload({ hello: "world" });
check("无法识别的内容不会新增题目", noResult.added === 0 && noResult.updated === 0);

console.log(`\n通过 ${passed} 项，失败 ${failures.length} 项`);
if (failures.length > 0) {
  console.log(failures.join("\n"));
  process.exit(1);
}




