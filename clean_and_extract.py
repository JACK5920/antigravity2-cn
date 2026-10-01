import json
import os
import re

def main():
    with open('E:/antigravity2-cn-main/extracted_main.js', 'r', encoding='utf-8', errors='ignore') as f:
        code = f.read()

    dict_dir = 'E:/antigravity2-cn-main/dicts'
    existing = set()
    for f in os.listdir(dict_dir):
        if f.endswith('.json'):
            with open(os.path.join(dict_dir, f), 'r', encoding='utf-8') as fp:
                for k in json.load(fp):
                    existing.add(k.strip().lower())

    # 精准提取双引号、单引号与 JSX 标签中的纯英文字符串
    candidates = []
    candidates += re.findall(r'"([A-Z][A-Za-z0-9 ,.?!:\-]{2,90})"', code)
    candidates += re.findall(r"'([A-Z][A-Za-z0-9 ,.?!:\-]{2,90})'", code)
    candidates += re.findall(r'>([A-Z][A-Za-z0-9 ,.?!:\-]{2,90})<', code)

    clean_ui = set()
    banned_chars = set(';{}<>=$\\()[]"\'`')
    banned_words = ['http', 'px', 'calc', 'rgba', 'module', 'webpack', 'chunk', '.js', '.png', '.svg', '.css', 'function', 'return', 'undefined', 'null', 'class', 'const', 'let', 'var']

    for c in candidates:
        s = c.strip()
        if len(s) < 3 or len(s) > 85:
            continue
        if any(ch in banned_chars for ch in s):
            continue
        if any(bad in s.lower() for bad in banned_words):
            continue
        if re.match(r'^[A-Z0-9_]+$', s):
            continue
        if not re.search(r'[a-zA-Z]', s):
            continue
        words = s.split()
        if len(words) == 1 and len(s) < 4:
            continue
        clean_ui.add(s)

    print(f"精准提取的纯 UI 英文词条数: {len(clean_ui)}")

    missing_clean = []
    for s in sorted(clean_ui):
        if s.lower() not in existing:
            missing_clean.append(s)

    print(f"实际漏译的纯净 UI 词条数: {len(missing_clean)}")

    categories = {
        "新增操作与按钮 (Buttons & Actions)": [],
        "新增设置项与安全规则 (Settings & Security)": [],
        "新增智能体与模型管理 (Agents & Models)": [],
        "新增对话与上下文管理 (Chat & Context)": [],
        "新增状态与通知 (Status & Alerts)": [],
        "其他通用界面文本 (General UI)": []
    }

    for s in missing_clean:
        s_low = s.lower()
        if any(k in s_low for k in ['add ', 'create ', 'delete ', 'edit ', 'remove ', 'save ', 'import ', 'export ', 'upload ', 'download ', 'copy ', 'clear ', 'reset ', 'retry ']):
            categories["新增操作与按钮 (Buttons & Actions)"].append(s)
        elif any(k in s_low for k in ['setting', 'security', 'permission', 'allow', 'sandbox', 'policy', 'privacy', 'auth', 'enable', 'disable', 'config']):
            categories["新增设置项与安全规则 (Settings & Security)"].append(s)
        elif any(k in s_low for k in ['agent', 'model', 'mcp', 'knowledge', 'prompt', 'gemini', 'claude', 'gpt', 'token', 'provider']):
            categories["新增智能体与模型管理 (Agents & Models)"].append(s)
        elif any(k in s_low for k in ['chat', 'message', 'conversation', 'thread', 'history', 'session', 'workspace']):
            categories["新增对话与上下文管理 (Chat & Context)"].append(s)
        elif any(k in s_low for k in ['error', 'failed', 'warning', 'success', 'loading', 'please', 'cannot', 'could not', 'invalid']):
            categories["新增状态与通知 (Status & Alerts)"].append(s)
        else:
            categories["其他通用界面文本 (General UI)"].append(s)

    for cat, items in categories.items():
        print(f"\n【{cat}】(共 {len(items)} 条):")
        for it in items[:6]:
            print(f"  • {it}")

    out_file = 'E:/antigravity2-cn-main/clean_missing_ui.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(categories, f, ensure_ascii=False, indent=2)
    print(f"\n结构化漏译清单已输出至: {out_file}")

if __name__ == '__main__':
    main()
