# 雅思口语题库练习记录（ielts-speaking-tracker）

一个**纯前端、本地运行**的雅思口语题库练习记录工具：按分区管理题目，记录 9 分答案、参考高级词语、暴露出的问题、自己的思路，以及练习状态与练习次数。

- 没有后端、没有账号、没有网络请求（除了读取本地的 `public/questions.json`）
- 所有数据保存在浏览器 `localStorage`，换设备时用「设置 → 导出 / 导入 JSON」

## 技术栈

| 用途 | 选型 |
| --- | --- |
| 框架 | React 18 + TypeScript + Vite 5 |
| 样式 | Tailwind CSS 3 |
| 状态管理 | Zustand 4 |
| 路由 | React Router 6 |
| 持久化 | localStorage（编辑框防抖 500ms 自动保存） |
| 图标 | lucide-react |
| 日期格式化 | date-fns |

## 快速开始

```bash
npm install
npm run dev      # 打开 http://localhost:5173
```

### 打不开 `http://localhost:5173/` 怎么办

这个站点**不是双击 `index.html` 就能打开的**，必须先启动本地服务：

1. **最省事**：双击项目根目录里的 `启动.cmd`（首次会自动 `npm install`，然后自动打开浏览器）。
2. **命令行**：`npm run dev`，看到终端打印 `Local: http://localhost:5173/` 之后再访问该地址。关掉终端窗口 = 服务停止，页面就打不开了。
3. **端口 5173 被占用**：`npm run dev -- --port 5174`，然后访问对应的新端口。
4. **不想跑 Vite**：项目里带了一份已构建好的静态版本 `dist/`，可以执行 `npm run serve`（零依赖静态服务器，默认 5173 端口），或用任意静态服务器托管 `dist/` 目录（SPA 路由需要回退到 `index.html`）。
5. **`localhost` 打不开、但 `127.0.0.1` 能打开**：说明浏览器先试了 IPv6（`::1`）。`scripts/serve-static.mjs` 已做双栈监听（同时监听 IPv4 与 IPv6），直接用 `npm run serve` 不会踩这个坑；若你用的是自己的静态服务器，请让它同时监听 `0.0.0.0` 与 `::`，或改用 `http://127.0.0.1:5173/`。
6. **页面能打开但白屏**：按 F12 打开浏览器控制台看报错信息；也可以先按 `Ctrl + F5` 强制刷新，排除缓存。

其他脚本：

```bash
npm run build      # 类型检查 + 产出静态文件到 dist/
npm run preview    # 本地预览构建结果
npm run typecheck  # 只做 TypeScript 类型检查
```

## 页面结构

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 题目列表 | 左侧七个分区导航；右侧题目列表，含搜索、状态筛选、进度条 |
| `/question/:id` | 题目详情 | 题目原文 / 9 分答案 / 高级词语 / 改进问题 / 我的思路 + 练习记录 |
| `/settings` | 设置 | 导出 JSON、导入 JSON、清空所有数据、总题数与已练题数 |

分区（左侧导航）与数据字段的对应关系：

| 分区 | `region` | `category` | `part` |
| --- | --- | --- | --- |
| 大陆新题 Part 1 | `mainland` | `new` | `Part 1` |
| 大陆新题 Part 2&3 | `mainland` | `new` | `Part 2&3` |
| 大陆保留题 Part 1 | `mainland` | `retained` | `Part 1` |
| 大陆万年老题 Part 1 | `mainland` | `classic` | `Part 1` |
| 大陆保留题 Part 2&3 | `mainland` | `retained` | `Part 2&3` |
| 非大陆新题 Part 1 | `non-mainland` | `new` | `Part 1` |
| 非大陆新题 Part 2&3 | `non-mainland` | `new` | `Part 2&3` |

> 不属于以上七个组合的题目（例如导入题库里的 `classic` + `Part 2&3`）会自动出现在左侧最后一个「其他题目」分区里，不会被隐藏。

## 目录结构

```
ielts-speaking-tracker/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig*.json
├── vite.config.ts
├── public/
│   ├── questions.json        # 示例题库（5 道，覆盖不同分区）—— 应用启动时读这个文件
│   └── questions-full.json   # 可选：2026 年 9-12 月完整题库（99 道），在设置页导入
└── src/
    ├── main.tsx              # 入口，挂载 BrowserRouter
    ├── App.tsx               # 启动时加载题库 + 路由表
    ├── index.css             # Tailwind 指令 + 基础样式
    ├── types.ts              # Question / PracticeStatus / Section 等类型与状态样式
    ├── data/sections.ts      # 七个分区定义、分区匹配、筛选选项
    ├── lib/
    │   ├── storage.ts        # localStorage 读写（records / custom-questions）
    │   ├── useAutoSaveDraft.ts # 防抖 500ms 自动保存 + 卸载时补写
    │   └── utils.ts          # cn / 日期格式化 / 文件下载等
    ├── store/useQuestionStore.ts # Zustand store：加载、合并、更新、导入导出
    ├── components/
    │   ├── Layout.tsx            # 顶部导航 + 页脚
    │   ├── SectionNav.tsx        # 左侧分区导航
    │   ├── QuestionListItem.tsx  # 列表卡片
    │   ├── StatusBadge.tsx       # 状态标签（未练 / 练过 / 熟练）
    │   ├── StatusSwitcher.tsx    # 状态切换按钮组
    │   ├── ProgressBar.tsx       # 已练 X / 总 Y 进度条
    │   ├── MetaChips.tsx         # 区域 / 类别 / Part 标签
    │   ├── AutoSaveInput.tsx     # 自动保存单行输入框
    │   ├── AutoSaveTextarea.tsx  # 自动保存多行文本框
    │   ├── QuestionTextEditor.tsx# 题目原文多行编辑
    │   ├── TagInput.tsx          # 高级词语标签输入
    │   ├── SaveIndicator.tsx     # 「保存中… / 已保存」提示
    │   └── ConfirmDialog.tsx     # 确认弹窗
    └── pages/
        ├── QuestionList.tsx      # 题目列表页
        ├── QuestionDetail.tsx    # 题目详情页
        └── Settings.tsx          # 设置页
```

## 数据模型

```ts
export type Question = {
  id: string;                     // 唯一标识，建议用「分区-序号/英文标题」这种可读写法
  region: 'mainland' | 'non-mainland';
  category: 'new' | 'retained' | 'classic';
  part: 'Part 1' | 'Part 2&3';
  title: string;                  // 英文标题
  titleZh?: string;               // 中文标题（可选）
  questions: string[];            // 题目原文：Part 1 是小问；Part 2&3 是卡片描述 + 追问
  ninePointAnswer: string;        // 9 分答案
  advancedWords: string[];        // 参考高级词语
  improvementIssues: string;      // 改进问题
  myThoughts: string;             // 我的思路
  status: 'not-practiced' | 'practiced' | 'familiar';
  practiceCount: number;
  lastPracticeDate?: string;      // ISO 字符串，点「练习次数 +1」时自动写入
};
```

## 如何扩充自己的题库

1. 打开 `public/questions.json`，按上面的字段格式继续往数组里加题目（只有 `title`、`questions` 是真正重要的字段，其余缺失时会自动补默认值）。
2. 保存后刷新页面（或到「设置」页点「重新读取 public/questions.json」）即可看到新题。
3. 也可以另外维护一个 JSON 文件，在「设置 → 导入 JSON」里合并进来：
   - 同 `id` 的题目：用导入的数据覆盖当前内容；
   - 题库里没有的 `id`：作为新题目追加（会保存在 localStorage 里，导出备份时一并带出）。

最小可用的一条题目：

```json
[
  {
    "id": "p1-new-topic",
    "region": "mainland",
    "category": "new",
    "part": "Part 1",
    "title": "New topic",
    "titleZh": "新话题",
    "questions": ["What do you think about it?"],
    "ninePointAnswer": "",
    "advancedWords": [],
    "improvementIssues": "",
    "myThoughts": "",
    "status": "not-practiced",
    "practiceCount": 0
  }
]
```

### 内置题库：99 道题，全部带 9 分答案

`public/questions.json`（与 `public/questions-full.json` 内容一致）是随项目内置的完整题库，整理自《2026年9-12月最新雅思口语题库》，共 **99 道题**，覆盖七个分区，而且**每一道题都预填了 9 分答案与参考高级词语**（合计 805 条词条）：

| 分区 | 题量 |
| --- | --- |
| 大陆新题 Part 1 | 11 |
| 大陆新题 Part 2&3 | 27 |
| 大陆保留题 Part 1 | 17 |
| 大陆万年老题 Part 1 | 5 |
| 大陆保留题 Part 2&3 | 27 |
| 非大陆新题 Part 1 | 6 |
| 非大陆新题 Part 2&3 | 6 |

答案的写法（方便直接开口练）：

- **Part 1**：按小问逐条作答，编号顺序与「题目原文」一致，例如 `1) What transport do you often use when travelling?` 下面就是该问的示范回答；
- **万年老题**（Work or studies / Home/accommodation / Hometown / The area you live in / The city you live in）小问特别多，答案按主题分成若干块，每块开头列出它覆盖的全部小问，便于对号入座；
- **Part 2&3**：分成两段 —— `【Part 2 示范答案】` 是一篇 150-200 词、可以直接说的完整口述稿（覆盖 You should say 的全部要点）；`【Part 3 观点与表达】` 每条先给中文观点，再给一句可以照搬的英文示范句；
- **参考高级词语**：格式为 `英文表达（中文释义）`，都是从对应答案里挑出来的地道搭配，考前过一遍即可。
「题目原文」的整理方式：

- **Part 1**：一行一个小问，顺序与答案编号对应；
- **Part 2&3**：整理成两大块 —— `【Part 2】` 下面是卡片题（Describe ...）和合并成一行的 You should say 要点，`【Part 3】` 下面是带编号的追问（`1.` `2.` …），编号与 9 分答案里 `【Part 3 观点与表达】` 的条目一一对应。分块标题在界面上以蓝色标签显示，不是输入框。

想换成自己的版本，直接编辑这两份 JSON 即可；也可以另存一份 JSON 再从设置页导入（导入是合并语义，见下）。
## 数据存储说明

- `localStorage` 键名：`ielts-speaking-tracker:records:v1`（用户改动与练习记录）、`ielts-speaking-tracker:custom-questions:v1`（导入追加的题目）。
- 应用启动时把 `public/questions.json`（+ 导入追加的题目）与本地记录**按 `id` 合并**，因此更新题库文件不会覆盖你的练习记录。
- 所有编辑框（标题、题目原文、9 分答案、改进问题、我的思路）在停止输入 500ms 后写入；离开页面时会立刻补写一次，不会丢字。
- 「清空所有数据」会删除上面两个键，题库回到 `questions.json` 的初始状态，操作不可撤销（建议先导出备份）。
### 为什么「换一个网页」就看不到练习记录了

`localStorage` 是**按网址隔离**的：它的作用域是「协议 + 主机 + 端口」。所以下面这些情况在浏览器看来是**不同的仓库**，数据不会互相同步：

| 情况 | 数据是否共享 |
| --- | --- |
| 同一网址下开多个标签页（甚至多个窗口） | 共享，而且现在会**实时自动同步**（一边改，另一边马上更新，不用刷新） |
| `http://localhost:5173/` 与 `http://127.0.0.1:5173/` | 不共享（主机名不同） |
| `:5173` 与 `:5180` 等不同端口 | 不共享 |
| Chrome、Edge、Codex 内置浏览器之间 | 不共享（各自的浏览器存储） |
| 普通窗口与无痕/隐私窗口 | 不共享，关掉无痕窗口数据就没了 |
| 这台电脑与另一台电脑 | 不共享（数据只在本机） |

这是浏览器的安全策略（网站无法读取另一个网址或另一个浏览器的数据），不是应用的缺陷。

**怎么把数据搬过去**：在旧网址打开应用 → 设置页 → 导出 JSON；再到新网址打开 → 设置页 → 导入 JSON（同 `id` 的题目会合并，练习记录一起带过去）。

**怎么避免踩坑**：

1. 固定用一个网址，推荐 `http://localhost:5173/`（设置页顶部会显示「当前网址」，旁边有「复制网址」按钮）；
2. 长期使用建议双击项目里的 `启动.cmd`，用自己电脑的 Chrome / Edge 打开（浏览器不会清理数据，记录最稳）；
3. 每周在设置页导出一份 JSON 备份，换设备时直接导入。


## 第一版不包含的功能

按需求刻意保持简单：30 天自动时间表、日历视图、Dashboard 图表、多次练习历史、题目分类打标签、富文本编辑器、用户登录、后端 API、移动端专门适配（仅做到响应式可用）。






