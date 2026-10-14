# -*- coding: utf-8 -*-
import io

PATH = r"C:\Users\Lucifer\Documents\Codex\2026-10-11\ko\outputs\ielts-speaking-tracker\README.md"
ANCHOR = "- 「清空所有数据」会删除上面两个键，题库回到 `questions.json` 的初始状态，操作不可撤销（建议先导出备份）。"

EXTRA = """
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
"""

raw = io.open(PATH, encoding="utf-8").read()
if ANCHOR not in raw:
    raise SystemExit("锚点没找到")
if "为什么「换一个网页」就看不到练习记录了" in raw:
    print("README 已经有这个章节，跳过")
else:
    io.open(PATH, "w", encoding="utf-8").write(raw.replace(ANCHOR, ANCHOR + EXTRA))
    print("README 已更新")
