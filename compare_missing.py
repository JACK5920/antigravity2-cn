import json
import os
import re

def main():
    dict_dir = 'E:/antigravity2-cn-main/dicts'
    tool_dict = {}
    for f in sorted(os.listdir(dict_dir)):
        if f.endswith('.json'):
            with open(os.path.join(dict_dir, f), 'r', encoding='utf-8') as fp:
                d = json.load(fp)
                for k, v in d.items():
                    k_str = str(k).strip()
                    tool_dict[k_str.lower()] = (k_str, str(v).strip(), f)

    print(f"工具当前词库条目数: {len(tool_dict)}")

    with open('E:/antigravity2-cn-main/extracted_main.js', 'r', encoding='utf-8', errors='ignore') as f:
        code = f.read()

    # 1. 匹配 JSX 静态文本节点: >Some Text<
    jsx_texts = re.findall(r'>([A-Z][A-Za-z0-9 ,.?!:;\'\"/()\-]{2,100})<', code)

    # 2. 匹配常见 UI 属性文本: label: "...", title: "...", placeholder: "..."
    prop_texts = re.findall(r'(?:label|title|placeholder|description|tooltip|helperText)\s*:\s*["\']([A-Z][A-Za-z0-9 ,.?!:;\'\"/()\-]{2,100})["\']', code)

    # 3. 匹配对话框及按钮文本
    button_texts = re.findall(r'["\']([A-Z][a-z]+(?: [A-Z0-9a-z][a-z0-9]+){1,8})["\']', code)

    all_raw = set(jsx_texts + prop_texts + button_texts)
    print(f"初步提取的前端候选界面文本: {len(all_raw)} 条")

    # 过滤明显的代码标识符、CSS类名、无效短语
    valid_ui = set()
    for s in all_raw:
        s = s.strip()
        if len(s) < 3 or len(s) > 120:
            continue
        if any(bad in s for bad in ['http:', 'https:', '.js', '.css', '.svg', '.png', 'px', 'calc(', 'rgb(', 'flex', 'font-', 'bg-']):
            continue
        if re.search(r'[{}\[\]<>=@$\\]', s):
            continue
        valid_ui.add(s)

    print(f"清洗后真实 UI 界面文本: {len(valid_ui)} 条")

    covered = []
    missing = []

    for text in sorted(valid_ui):
        t_lower = text.lower()
        if t_lower in tool_dict:
            covered.append((text, tool_dict[t_lower][1], tool_dict[t_lower][2]))
        else:
            # 检查是否有长句覆盖
            is_sub = False
            for k_lower in tool_dict:
                if len(k_lower) > 15 and k_lower in t_lower:
                    is_sub = True
                    break
            if is_sub:
                covered.append((text, "部分命中", "fuzzy"))
            else:
                missing.append(text)

    print(f"\n================ 碰撞统计结果 ================")
    print(f"已汉化覆盖条目: {len(covered)} 条")
    print(f"未汉化/漏译条目: {len(missing)} 条")
    coverage_rate = (len(covered) / len(valid_ui) * 100) if valid_ui else 0
    print(f"工具对实际 UI 前端字符串的覆盖率: {coverage_rate:.2f}%")

    # 进一步筛选出高价值的界面核心漏译项（按类别分类）
    categories = {
        "按钮与操作 (Buttons & Actions)": [],
        "设置与配置项 (Settings & Config)": [],
        "提示与状态信息 (Notices & Status)": [],
        "智能体与工作区 (Agents & Workspace)": []
    }

    for item in missing:
        words = item.split()
        if len(words) < 2 and len(item) < 6:
            continue
        item_lower = item.lower()
        if any(act in item_lower for act in ['button', 'click', 'submit', 'cancel', 'create', 'delete', 'select', 'choose', 'add', 'edit', 'save', 'retry', 'install']):
            categories["按钮与操作 (Buttons & Actions)"].append(item)
        elif any(cfg in item_lower for cfg in ['setting', 'enable', 'disable', 'config', 'option', 'mode', 'default', 'preference', 'allow', 'proxy', 'port']):
            categories["设置与配置项 (Settings & Config)"].append(item)
        elif any(stat in item_lower for stat in ['please', 'failed', 'success', 'warning', 'error', 'loading', 'connecting', 'could not', 'cannot', 'required']):
            categories["提示与状态信息 (Notices & Status)"].append(item)
        elif any(ag in item_lower for ag in ['agent', 'workspace', 'model', 'prompt', 'context', 'chat', 'thread', 'mcp', 'knowledge', 'token']):
            categories["智能体与工作区 (Agents & Workspace)"].append(item)

    print("\n================ 分模块漏译抽样 ================")
    for cat_name, items in categories.items():
        print(f"\n【{cat_name}】共发现 {len(items)} 条漏译:")
        for it in items[:10]:
            print(f"  - {it}")

    # 保存漏译清单供后续比对汉化
    missing_report_path = 'E:/antigravity2-cn-main/missing_ui_strings.json'
    with open(missing_report_path, 'w', encoding='utf-8') as out_fp:
        json.dump({
            "total_ui_strings": len(valid_ui),
            "covered_count": len(covered),
            "missing_count": len(missing),
            "coverage_rate": f"{coverage_rate:.2f}%",
            "categorized_missing": categories,
            "all_missing_samples": missing[:200]
        }, out_fp, ensure_ascii=False, indent=2)
    print(f"\n漏译完整样本已写入: {missing_report_path}")

if __name__ == '__main__':
    main()
