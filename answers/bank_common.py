# -*- coding: utf-8 -*-
"""把 questions-full.json 与内置示例题合并成最终题库（示例题保留自己的 id 与示范内容）。"""
import io
import json
import os

WORK = r"C:\Users\Lucifer\Documents\Codex\2026-10-11\ko\work\ielts-speaking-tracker"
FULL = os.path.join(WORK, "public", "questions-full.json")
SAMPLE = os.path.join(WORK, "public", "questions.json")

ORDER = [
    ("mainland", "new", "Part 1"),
    ("mainland", "new", "Part 2&3"),
    ("mainland", "retained", "Part 1"),
    ("mainland", "classic", "Part 1"),
    ("mainland", "retained", "Part 2&3"),
    ("non-mainland", "new", "Part 1"),
    ("non-mainland", "new", "Part 2&3"),
]


def build_merged():
    full = json.load(io.open(FULL, encoding="utf-8"))
    samples = json.load(io.open(SAMPLE, encoding="utf-8"))
    by_key = {(q["region"], q["category"], q["part"], q["title"]): q for q in samples}
    merged = []
    for item in full:
        key = (item["region"], item["category"], item["part"], item["title"])
        merged.append(by_key.get(key, item))
    merged.sort(key=lambda q: (ORDER.index((q["region"], q["category"], q["part"])),))
    return merged


if __name__ == "__main__":
    merged = build_merged()
    for combo in ORDER:
        rows = [q for q in merged if (q["region"], q["category"], q["part"]) == combo]
        print("#####", combo, len(rows))
        for q in rows:
            p3 = len([s for s in q["questions"] if s.startswith("Part 3: ")])
            print("{} | {} | 题目{}条 P3={}".format(q["id"], q["title"], len(q["questions"]), p3))
    print("total", len(merged))
