import json
import re

with open('E:/antigravity2-cn-main/extracted_main.js', 'r', encoding='utf-8', errors='ignore') as f:
    code = f.read()

matches = []
matches += re.findall(r'["\']([A-Z][^"\'\n]{2,40}Tool[^"\'\n]{0,30})["\']', code)
matches += re.findall(r'["\']([A-Z][^"\'\n]{0,30}Diff[^"\'\n]{0,30})["\']', code)
matches += re.findall(r'["\']([A-Z][^"\'\n]{0,30}Command[^"\'\n]{0,30})["\']', code)
matches += re.findall(r'["\']([A-Z][^"\'\n]{0,30}Step[^"\'\n]{0,30})["\']', code)

clean_matches = set()
for m in matches:
    if any(bad in m for bad in ['http', 'px', '.js', '{', '}', ';', '=', '<', '>', '\\']):
        continue
    words = m.split()
    if 1 <= len(words) <= 6:
        clean_matches.add(m.strip())

# 检查当前字典是否覆盖
with open('E:/antigravity2-cn-main/dicts/common.json', 'r', encoding='utf-8') as f:
    dict_data = json.load(f)

print("=== 工具调用、命令执行与步骤状态相关词条及其覆盖状态 ===")
covered_cnt = 0
uncovered = []
for m in sorted(clean_matches):
    is_cov = m in dict_data or m.lower() in [k.lower() for k in dict_data]
    if is_cov:
        covered_cnt += 1
    else:
        uncovered.append(m)

print(f"总计识别条目: {len(clean_matches)} 条 | 已覆盖: {covered_cnt} 条 | 未覆盖: {len(uncovered)} 条\n")

print("【已覆盖精选】:")
for m in sorted(clean_matches):
    if m in dict_data or m.lower() in [k.lower() for k in dict_data]:
        val = dict_data.get(m, dict_data.get(m.lower()))
        print(f"  √ {m:35s} -> {val}")

print("\n【未覆盖抽样 (待补全的工具调用卡片文本)】:")
for m in uncovered[:25]:
    print(f"  × {m}")
