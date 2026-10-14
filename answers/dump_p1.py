# -*- coding: utf-8 -*-
import io, os, json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bank_common import build_merged

merged = build_merged()
for q in merged:
    if q["part"] != "Part 1":
        continue
    print("###", q["id"], "|", q["title"])
    for s in q["questions"]:
        print("   -", s)
