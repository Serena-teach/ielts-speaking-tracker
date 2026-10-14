# -*- coding: utf-8 -*-
import collections
import io
import json
import re

p = r"C:\Users\Lucifer\Documents\Codex\2026-10-11\ko\outputs\ielts-speaking-tracker\public\questions.json"
data = json.load(io.open(p, encoding="utf-8"))
en = 0
cn = 0
per_section = collections.Counter()
for q in data:
    text = q["ninePointAnswer"]
    en += len(re.findall("[A-Za-z][A-Za-z'-]*", text))
    cn += len(re.findall(r"[\u4e00-\u9fff]", text))
    per_section[(q["region"], q["category"], q["part"])] += 1

print("题目总数:", len(data))
print("有 9 分答案:", sum(1 for q in data if q["ninePointAnswer"].strip()))
print("英文词数（答案内）:", en)
print("中文字数（答案内）:", cn)
print("高级词语条数:", sum(len(q["advancedWords"]) for q in data))
print("平均每题英文词数:", round(en / len(data)))
for key, value in per_section.items():
    print("   ", key, value)
