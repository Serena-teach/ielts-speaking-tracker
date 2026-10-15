import { useState } from "react";
import { ArrowLeft, Plus , Minus} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AutoSaveInput } from "../components/AutoSaveInput";
import { AutoSaveTextarea } from "../components/AutoSaveTextarea";
import { MetaChips } from "../components/MetaChips";
import { QuestionTextEditor } from "../components/QuestionTextEditor";
import { StatusSwitcher } from "../components/StatusSwitcher";
import { TagInput } from "../components/TagInput";
import { formatDateTime } from "../lib/utils";
import { useQuestionStore } from "../store/useQuestionStore";
import type { QuestionPatch } from "../store/useQuestionStore";

/**
 * 题目详情页（/question/:id）
 * 左侧是内容编辑区（题目原文 / 9 分答案 / 高级词语 / 改进问题 / 我的思路），
 * 右侧是练习记录卡（状态切换、次数 +1、最后练习时间）。
 */
const ANSWER_SECTIONS = ["【Part 1 示范答案】", "【Part 2 示范答案】", "【Part 3 观点与表达】", "【Part 3 全文】"];

/** 把 9 分答案按小节标题切开，方便分块阅读（新版答案含 Part 3 全文） */
function splitAnswerSections(text: string): { title: string; body: string }[] {
  const found = ANSWER_SECTIONS
    .map((title) => ({ title, at: text.indexOf(title) }))
    .filter((item) => item.at >= 0)
    .sort((a, b) => a.at - b.at);
  if (!found.length) return [{ title: "全部内容", body: text }];
  const head = text.slice(0, found[0].at).trim();
  const parts = found.map((item, index) => ({
    title: item.title,
    body: text
      .slice(item.at + item.title.length, index + 1 < found.length ? found[index + 1].at : text.length)
      .trim(),
  }));
  return head ? [{ title: "开头", body: head }, ...parts] : parts;
}
export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const question = useQuestionStore((state) =>
    state.questions.find((item) => item.id === id)
  );
  const loaded = useQuestionStore((state) => state.loaded);
  const updateQuestion = useQuestionStore((state) => state.updateQuestion);
  const incrementPractice = useQuestionStore((state) => state.incrementPractice);
  const decrementPractice = useQuestionStore((state) => state.decrementPractice);
  const setStatus = useQuestionStore((state) => state.setStatus);
  // 9 分答案分节阅读（Part 2 示范 / Part 3 观点 / Part 3 全文）
  const answerSections = splitAnswerSections(question?.ninePointAnswer ?? "");
  const [activeSection, setActiveSection] = useState(0);
  const [editingAnswer, setEditingAnswer] = useState(false);
  const currentSection = answerSections[Math.min(activeSection, answerSections.length - 1)];

  if (!question) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <h1 className="text-lg font-semibold text-slate-900">
          {loaded ? "没有找到这道题" : "正在加载题库…"}
        </h1>
        {loaded ? (
          <p className="mt-2 text-sm text-slate-500">
            题目 id「{id}」不存在，可能已被删除或题库文件已更新。
          </p>
        ) : null}
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          返回题库
        </Link>
      </div>
    );
  }

  const patch = (values: QuestionPatch) => updateQuestion(question.id, values);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-900"
        >
          <ArrowLeft className="h-4 w-4" />
          返回题库
        </Link>
        <MetaChips question={question} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <section className="card">
            <div className="grid gap-4 sm:grid-cols-2">
              <AutoSaveInput
                label="标题（英文）"
                value={question.title}
                onSave={(next) => patch({ title: next })}
                placeholder="Travelling"
                inputClassName="font-semibold"
              />
              <AutoSaveInput
                label="题目中文（可选）"
                value={question.titleZh ?? ""}
                onSave={(next) => patch({ titleZh: next })}
                placeholder="旅行"
              />
            </div>

            <div className="mt-6">
              <p className="card-title mb-2">题目原文（英文）</p>
              <QuestionTextEditor
                key={question.id}
                questions={question.questions}
                onChange={(next) => patch({ questions: next })}
              />
            </div>
          </section>

          <section className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="card-title">9 分答案</p>
              <button
                type="button"
                onClick={() => setEditingAnswer((value) => !value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                {editingAnswer ? "收起编辑框" : "编辑原文"}
              </button>
            </div>

            {editingAnswer ? (
              <div className="mt-3">
                <AutoSaveTextarea
                  label="9 分答案（可编辑）"
                  value={question.ninePointAnswer}
                  onSave={(next) => patch({ ninePointAnswer: next })}
                  rows={18}
                  serif
                  showCount
                  placeholder={"I'd say the metro is my go-to option…\n\n建议写完整段落，方便出声练习时直接照着说。"}
                  hint="改完自动保存；这里改的是「我的版本」，题库原文不会被改动。"
                />
              </div>
            ) : (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  {answerSections.map((section, index) => {
                    const active = index === Math.min(activeSection, answerSections.length - 1);
                    return (
                      <button
                        key={section.title}
                        type="button"
                        onClick={() => setActiveSection(index)}
                        className={
                          "rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition " +
                          (active
                            ? "bg-brand-900 text-white ring-brand-900"
                            : "bg-white text-slate-600 ring-slate-200 hover:text-slate-900")
                        }
                      >
                        {section.title.replace(/[【】]/g, "")}
                        <span className="ml-1.5 font-normal opacity-70">{(section.body.length / 1).toFixed(0)} 字</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <pre className="whitespace-pre-wrap font-serif text-[15px] leading-7 text-slate-800">
                    {currentSection?.body}
                  </pre>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  上方按钮可切换小节；点「编辑原文」可以在同一块里改自己的版本。
                </p>
              </>
            )}
          </section>

          <section className="card">
            <p className="card-title mb-3">参考高级词语</p>
            <TagInput
              tags={question.advancedWords}
              onChange={(next) => patch({ advancedWords: next })}
            />
            <p className="mt-2 text-xs text-slate-400">
              只收藏自己真的会用进句子里的表达，避免考场想不起来。
            </p>
          </section>

          <section className="card">
            <AutoSaveTextarea
              label="改进问题"
              collapsible
              value={question.improvementIssues}
              onSave={(next) => patch({ improvementIssues: next })}
              rows={6}
              placeholder={"例如：\n- 时态前后不一致\n- 连接词只有 and / but\n- 答案太短，缺少原因和例子"}
              hint="记录每次练习暴露的问题，下次练习前先过一遍。"
            />
          </section>

          <section className="card">
            <AutoSaveTextarea
              label="我的思路"
              collapsible
              value={question.myThoughts}
              onSave={(next) => patch({ myThoughts: next })}
              rows={8}
              placeholder={"关键词提纲 / 结构 / 可套用的个人例子…"}
              hint="Part 2 建议按 4 个关键词写提纲，考场上只记关键词不背原文。"
            />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="card">
            <h2 className="text-sm font-semibold text-slate-900">练习记录</h2>
            <div className="mt-3">
              <StatusSwitcher
                value={question.status}
                onChange={(status) => setStatus(question.id, status)}
              />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">练习次数</dt>
                <dd className="font-semibold tabular-nums text-slate-900">
                  {question.practiceCount} 次
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-slate-500">最后练习</dt>
                <dd className="text-right tabular-nums text-slate-700">
                  {formatDateTime(question.lastPracticeDate)}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => incrementPractice(question.id)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
            >
              <Plus className="h-4 w-4" />
              练习次数 +1
            </button>
            <button
              type="button"
              onClick={() => decrementPractice(question.id)}
              disabled={(question.practiceCount ?? 0) <= 0}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white"
              title="点错了？用这里撤销一次"
            >
              <Minus className="h-4 w-4" />
              撤销一次练习
            </button>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              点击「+1」自动把当前时间记为最后练习日期；首次练习会从「未练」升级为「练过」。
              点错或重复记录时，用「撤销一次练习」把次数减回去（减到 0 会清空最后练习时间）。
            </p>
          </section>

          <section className="card text-xs leading-relaxed text-slate-500">
            <p className="text-sm font-semibold text-slate-700">小提示</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>所有输入框停止输入 500ms 后自动保存到浏览器本地。</li>
              <li>换设备之前，记得在「设置」页导出 JSON 备份。</li>
              <li>题目原文支持多行，Part 2 可以写卡片描述再写追问。</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
