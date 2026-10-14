# -*- coding: utf-8 -*-
"""把 answers/ans_*.py 里的 9 分答案与高级词语合并进题库，
并把 Part 2&3 的题目原文整理成【Part 2】/【Part 3】两大块，然后写出 public/ 与 dist/ 的 JSON。"""
import glob
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bank_common import build_merged, WORK

PROJECT = r"C:\Users\Lucifer\Documents\Codex\2026-10-11\ko\outputs\ielts-speaking-tracker"
P3_PREFIX = "Part 3: "
SHOULD_SAY_RE = re.compile(r"^You should say[:：]?$")
SENTENCE_END_RE = re.compile(r"^You should say[:：]\s*(.+)$")


def reformat_part23(question):
    # 幂等保护：已经整理成【Part 2】/【Part 3】两大块的题再跑一次会破坏结构，直接跳过
    if question.get("questions") and question["questions"][0].strip() == "【Part 2】":
        return
    """Part 2&3 的题目原文：合并成一个 Part 2 块（卡片题 + you should say 要点）和一个 Part 3 块（编号追问）。"""
    title = ""
    bullets = []
    follow_ups = []

    for raw in question["questions"]:
        text = (raw or "").strip()
        if not text:
            continue
        if text.startswith(P3_PREFIX):
            follow_ups.append(text[len(P3_PREFIX):].strip())
            continue
        if SHOULD_SAY_RE.match(text):
            continue
        # 有些条目把 "You should say: What ..." 写在一行里
        inline = SENTENCE_END_RE.match(text)
        if inline:
            bullets.append(inline.group(1).strip())
            continue
        if not title:
            title = text
        else:
            bullets.append(text)

    items = ["【Part 2】"]
    if title:
        items.append(title)
    if bullets:
        items.append("You should say: " + " / ".join(bullets))
    if follow_ups:
        items.append("【Part 3】")
        for index, item in enumerate(follow_ups, start=1):
            items.append("{}. {}".format(index, item))

    if len(items) > 1:
        question["questions"] = items


def load_answers():
    answers = {}
    for path in sorted(glob.glob(os.path.join(WORK, "answers", "ans_*.py"))):
        namespace = {}
        with io.open(path, encoding="utf-8") as handle:
            exec(compile(handle.read(), path, "exec"), namespace)
        for key, value in namespace.get("ANS", {}).items():
            answers[key] = value
    return answers


def main():
    merged = build_merged()
    answers = load_answers()
    ids = {q["id"] for q in merged}

    unknown = sorted(set(answers) - ids)
    if unknown:
        print("[警告] 有答案找不到对应题目:", unknown)

    missing = []
    for question in merged:
        item = answers.get(question["id"], {})
        answer = item.get("answer", "").strip()
        words = item.get("words", [])
        if answer:
            question["ninePointAnswer"] = answer
            question["advancedWords"] = words
        elif not question["ninePointAnswer"].strip():
            missing.append(question["id"])
        if question["part"] == "Part 2&3":
            reformat_part23(question)

    payload = json.dumps(merged, ensure_ascii=False, indent=2) + "\n"
    targets = [
        os.path.join(WORK, "public", "questions.json"),
        os.path.join(WORK, "public", "questions-full.json"),
        os.path.join(PROJECT, "public", "questions.json"),
        os.path.join(PROJECT, "public", "questions-full.json"),
        os.path.join(PROJECT, "dist", "questions.json"),
        os.path.join(PROJECT, "dist", "questions-full.json"),
    ]
    for target in targets:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with io.open(target, "w", encoding="utf-8") as handle:
            handle.write(payload)

    part23 = [q for q in merged if q["part"] == "Part 2&3"]
    blocked = [q for q in part23 if q["questions"][0] == "【Part 2】" and "【Part 3】" in q["questions"]]
    print("题目总数:", len(merged))
    print("已填 9 分答案:", len([q for q in merged if q["ninePointAnswer"].strip()]))
    print("仍缺答案:", len(missing), missing[:10])
    print("高级词语总数:", sum(len(q["advancedWords"]) for q in merged))
    print("Part 2&3 已分成两大块:", len(blocked), "/", len(part23))
    print("写入文件:", len(targets))


if __name__ == "__main__":
    main()
