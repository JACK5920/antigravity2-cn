import json
import os
import re

# 1. 基础术语核心映射表 (英文 -> (简体, 繁体))
TERM_MAP = {
    # 核心架构
    "agent": ("智能体", "智能體"),
    "agents": ("智能体", "智能體"),
    "model": ("模型", "模型"),
    "models": ("模型", "模型"),
    "workspace": ("工作区", "工作區"),
    "workspaces": ("工作区", "工作區"),
    "mcp": ("MCP", "MCP"),
    "mcp server": ("MCP 服务器", "MCP 伺服器"),
    "mcp servers": ("MCP 服务器", "MCP 伺服器"),
    "knowledge": ("知识库", "知識庫"),
    "hook": ("Hook 钩子", "Hook 鉤子"),
    "hooks": ("Hook 钩子", "Hook 鉤子"),
    "prompt": ("提示词", "提示詞"),
    "prompts": ("提示词", "提示詞"),
    "token": ("Token", "Token"),
    "tokens": ("Token", "Token"),
    "context": ("上下文", "上下文"),
    "conversation": ("对话", "對話"),
    "conversations": ("对话", "對話"),
    "thread": ("对话会话", "對話工作階段"),
    "threads": ("对话会话", "對話工作階段"),
    "session": ("会话", "工作階段"),
    "sessions": ("会话", "工作階段"),
    "terminal": ("终端", "終端機"),
    "terminals": ("终端", "終端機"),
    "allowlist": ("白名单", "白名單"),
    "denylist": ("黑名单", "黑名單"),
    "sandbox": ("沙箱", "沙箱"),
    "setting": ("设置", "設定"),
    "settings": ("设置", "設定"),
    "preference": ("首选项", "偏好設定"),
    "preferences": ("首选项", "偏好設定"),
    "permission": ("权限", "權限"),
    "permissions": ("权限", "權限"),
    "security": ("安全", "安全"),
    "policy": ("策略", "原則"),
    "handler": ("处理器", "處理常式"),
    "handlers": ("处理器", "處理常式"),
    "custom model": ("自定义模型", "自訂模型"),
    "custom models": ("自定义模型", "自訂模型"),
    "provider": ("提供商", "提供者"),
    "providers": ("提供商", "提供者"),
    "gemini": ("Gemini", "Gemini"),
    "claude": ("Claude", "Claude"),
    "google chrome": ("Google Chrome", "Google Chrome"),
    "command": ("命令", "命令"),
    "commands": ("命令", "命令"),
    "environment": ("环境", "環境"),
    "environments": ("环境", "環境"),
    "archive": ("归档", "封存"),
    "unarchive": ("取消归档", "取消封存"),
    "dogfood": ("内部测试", "內部測試"),
}

# 2. 常见专用句子与高频词汇精确对照表
EXACT_TRANSLATIONS = {
    "Add Comment": ("添加评论", "新增留言"),
    "Add Custom Model": ("添加自定义模型", "新增自訂模型"),
    "Add Handler": ("添加处理器", "新增處理常式"),
    "Add Hook Card": ("添加 Hook 卡片", "新增 Hook 卡片"),
    "Add MCP": ("添加 MCP", "新增 MCP"),
    "Add MCP Server": ("添加 MCP 服务器", "新增 MCP 伺服器"),
    "Add Model": ("添加模型", "新增模型"),
    "Add New Handler to": ("添加新处理器至", "新增處理常式至"),
    "Add Terminal": ("新建终端", "新增終端機"),
    "Add to allowlist": ("添加到白名单", "新增至白名單"),
    "Added to allowlist": ("已添加到白名单", "已新增至白名單"),
    "Agent Hooks Configuration": ("智能体 Hook 钩子配置", "智能體 Hook 鉤子設定"),
    "Agent Script Command Configuration": ("智能体脚本命令配置", "智能體指令碼命令設定"),
    "Agent Security Settings": ("智能体安全设置", "智能體安全設定"),
    "Agent needs permission to execute JavaScript": ("智能体需要执行 JavaScript 的权限", "智能體需要執行 JavaScript 的權限"),
    "Agent security mode": ("智能体安全模式", "智能體安全模式"),
    "Agent options": ("智能体选项", "智能體選項"),
    "Agent Host Address": ("智能体主机地址", "智能體主機位址"),
    "Agent Edits": ("智能体编辑项", "智能體編輯項目"),
    "Agent Market Search Results": ("智能体市场搜索结果", "智能體市集搜尋結果"),
    "Agent Platform": ("智能体平台", "智能體平台"),
    "Agent Script": ("智能体脚本", "智能體指令碼"),
    "Agent Stopped": ("智能体已停止", "智能體已停止"),
    "Agent Team": ("智能体团队", "智能體團隊"),
    "Agent can": ("智能体可以", "智能體可以"),
    "Agent can run": ("智能体可以运行", "智能體可以執行"),
    "Agent terminated due to error": ("智能体因错误终止", "智能體因錯誤終止"),
    "Allow in Conversation": ("在对话中允许", "在對話中允許"),
    "Allow options": ("允许选项", "允許選項"),
    "Allow remote debugging for this browser instance": ("允许此浏览器实例进行远程调试", "允許此瀏覽器執行個體進行遠端偵錯"),
    "Allow sandboxed commands to make network requests": ("允许沙箱中的命令发出网络请求", "允許沙箱中的命令發出網路請求"),
    "All Workspaces": ("所有工作区", "所有工作區"),
    "Archive Workspace": ("归档工作区", "封存工作區"),
    "Archive this conversation": ("归档此对话", "封存此對話"),
    "Access a file outside workspace": ("访问工作区外的文件", "存取工作區外的檔案"),
    "Access grants": ("访问授权", "存取授權"),
    "Command and file access granted to the automation agents.": ("授予自动化智能体的命令与文件访问权限。", "授予自動化智能體的命令與檔案存取權限。"),
    "Active Context Start": ("活跃上下文起点", "使用中上下文起點"),
    "Active token streaming duration from the language model.": ("来自语言模型的活跃 Token 流式传输时长。", "來自語言模型的活躍 Token 串流傳輸時長。"),
    "A Gemini-powered security agent decides if commands should be auto-approved.": ("由 Gemini 驱动的安全智能体决定命令是否应自动批准。", "由 Gemini 驅動的安全智能體決定命令是否應自動核准。"),
    "A shell setup script run before every command the agent executes.": ("智能体执行每条命令前运行的 Shell 初始化脚本。", "智能體執行每條命令前執行的 Shell 初始化指令碼。"),
    "An error occurred while checking the port. Please try again.": ("检查端口时发生错误，请重试。", "檢查連接埠時發生錯誤，請重試。"),
    "An error occurred while submitting your feedback. Please try again.": ("提交反馈时发生错误，请重试。", "提交意見反應時發生錯誤，請重試。"),
    "An unexpected error occurred during creation": ("创建过程中发生意外错误", "建立過程中發生非預期錯誤"),
    "Assertion Failed": ("断言失败", "判斷提示失敗"),
    "Authentication failed": ("身份验证失败", "驗證失敗"),
    "Authorization Required": ("需要授权", "需要授權"),
    "Battle start failed": ("启动评测失败", "啟動評測失敗"),
    "Cannot close persistent tab": ("无法关闭常驻标签页", "無法關閉常駐分頁"),
    "Cannot mutate an immutable Map": ("无法修改不可变的 Map 映射", "無法修改不可變的 Map 對應"),
    "Clear conversation": ("清空对话", "清除對話"),
    "Clear all conversations": ("清空所有对话", "清除所有對話"),
    "Delete Workspace": ("删除工作区", "刪除工作區"),
    "Delete Model": ("删除模型", "刪除模型"),
    "Edit Model": ("编辑模型", "編輯模型"),
    "Edit Configuration": ("编辑配置", "編輯設定"),
    "Enable Custom Models": ("启用自定义模型", "啟用自訂模型"),
    "Disable Custom Models": ("禁用自定义模型", "停用自訂模型"),
    "Enable Agent Hooks": ("启用智能体 Hooks 钩子", "啟用智能體 Hooks 鉤子"),
    "Disable Agent Hooks": ("禁用智能体 Hooks 钩子", "停用智能體 Hooks 鉤子"),
    "Export Configuration": ("导出配置", "匯出設定"),
    "Import Configuration": ("导入配置", "匯入設定"),
    "Install MCP Server": ("安装 MCP 服务器", "安裝 MCP 伺服器"),
    "Uninstall MCP Server": ("卸载 MCP 服务器", "解除安裝 MCP 伺服器"),
    "Manage MCP Servers": ("管理 MCP 服务器", "管理 MCP 伺服器"),
    "Manage Knowledge Base": ("管理知识库", "管理知識庫"),
    "Refresh Status": ("刷新状态", "重新整理狀態"),
    "Restart Agent": ("重启智能体", "重新啟動智能體"),
    "Stop Agent": ("停止智能体", "停止智能體"),
    "Run in Background": ("在后台运行", "在背景執行"),
    "Run in Terminal": ("在终端中运行", "在終端機中執行"),
    "Save Changes": ("保存更改", "儲存變更"),
    "Discard Changes": ("放弃更改", "捨棄變更"),
    "Select All": ("全选", "全選"),
    "Select None": ("取消全选", "全部取消選取"),
    "Select Model": ("选择模型", "選取模型"),
    "Select Workspace": ("选择工作区", "選取工作區"),
    "Show Details": ("显示详情", "顯示詳細資料"),
    "Hide Details": ("隐藏详情", "隱藏詳細資料"),
    "Show More": ("显示更多", "顯示更多"),
    "Show Less": ("收起", "收起"),
    "Token Limit Exceeded": ("超出 Token 上限", "超出 Token 上限"),
    "Rate limit exceeded. Please try again later.": ("超出速率限制，请稍后重试。", "超出速率限制，請稍後重試。"),
    "Failed to connect to language server": ("连接语言服务失败", "連線至語言伺服器失敗"),
    "Connected to language server": ("已连接到语言服务", "已連線至語言伺服器"),
    "Reconnecting to language server...": ("正在重新连接语言服务...", "正在重新連線至語言伺服器..."),
}

# 简繁转换常用词替换表
TW_CONVERSIONS = [
    ("服务器", "伺服器"),
    ("设置", "設定"),
    ("配置", "設定"),
    ("智能体", "智能體"),
    ("工作区", "工作區"),
    ("对话", "對話"),
    ("会话", "工作階段"),
    ("终端", "終端機"),
    ("白名单", "白名單"),
    ("黑名单", "黑名單"),
    ("信息", "資訊"),
    ("创建", "建立"),
    ("保存", "儲存"),
    ("默认", "預設"),
    ("脚本", "指令碼"),
    ("网络", "網路"),
    ("连接", "連線"),
    ("删除", "刪除"),
    ("项目", "專案"),
    ("支持", "支援"),
    ("权限", "權限"),
    ("验证", "驗證"),
    ("启用", "啟用"),
    ("禁用", "停用"),
    ("端口", "連接埠"),
    ("标签页", "分頁"),
    ("实例", "執行個體"),
    ("文件", "檔案"),
]

def to_tw(text_cn):
    res = text_cn
    for cn, tw in TW_CONVERSIONS:
        res = res.replace(cn, tw)
    return res

def translate_phrase(text):
    text_clean = text.strip()
    # 1. 精确匹配
    if text_clean in EXACT_TRANSLATIONS:
        return EXACT_TRANSLATIONS[text_clean]

    # 2. 模式匹配: Add / Delete / Edit / Create / Select / Enable / Disable
    patterns = [
        (r"^Add (.+)$", "添加{}", "新增{}"),
        (r"^Create (.+)$", "创建{}", "建立{}"),
        (r"^Delete (.+)$", "删除{}", "刪除{}"),
        (r"^Edit (.+)$", "编辑{}", "編輯{}"),
        (r"^Remove (.+)$", "移除{}", "移除{}"),
        (r"^Select (.+)$", "选择{}", "選取{}"),
        (r"^Enable (.+)$", "启用{}", "啟用{}"),
        (r"^Disable (.+)$", "禁用{}", "停用{}"),
        (r"^Configure (.+)$", "配置{}", "設定{}"),
        (r"^Manage (.+)$", "管理{}", "管理{}"),
        (r"^View (.+)$", "查看{}", "檢視{}"),
        (r"^Clear (.+)$", "清空{}", "清除{}"),
        (r"^Reset (.+)$", "重置{}", "重設{}"),
        (r"^Search (.+)$", "搜索{}", "搜尋{}"),
        (r"^Import (.+)$", "导入{}", "匯入{}"),
        (r"^Export (.+)$", "导出{}", "匯出{}"),
        (r"^Refresh (.+)$", "刷新{}", "重新整理{}"),
        (r"^Toggle (.+)$", "切换{}", "切換{}"),
        (r"^Show (.+)$", "显示{}", "顯示{}"),
        (r"^Hide (.+)$", "隐藏{}", "隱藏{}"),
        (r"^Close (.+)$", "关闭{}", "關閉{}"),
        (r"^Open (.+)$", "打开{}", "開啟{}"),
        (r"^Failed to (.+)$", "无法{}", "無法{}"),
        (r"^Cannot (.+)$", "无法{}", "無法{}"),
        (r"^Could not (.+)$", "未能{}", "未能{}"),
        (r"^Please (.+)$", "请{}", "請{}"),
    ]

    for pat, tmpl_cn, tmpl_tw in patterns:
        m = re.match(pat, text_clean)
        if m:
            sub = m.group(1).strip()
            sub_low = sub.lower()
            if sub_low in TERM_MAP:
                sub_cn, sub_tw = TERM_MAP[sub_low]
            else:
                sub_cn = sub
                sub_tw = sub
            return (tmpl_cn.format(sub_cn), tmpl_tw.format(sub_tw))

    # 3. 后缀模式: ... Settings / ... Configuration / ... Mode / ... Options
    suffix_patterns = [
        (r"^(.+) Settings$", "{}设置", "{}設定"),
        (r"^(.+) Configuration$", "{}配置", "{}設定"),
        (r"^(.+) Options$", "{}选项", "{}選項"),
        (r"^(.+) Mode$", "{}模式", "{}模式"),
        (r"^(.+) Failed$", "{}失败", "{}失敗"),
        (r"^(.+) Successful$", "{}成功", "{}成功"),
        (r"^(.+) Error$", "{}错误", "{}錯誤"),
        (r"^(.+) Details$", "{}详情", "{}詳細資料"),
        (r"^(.+) List$", "{}列表", "{}清單"),
        (r"^(.+) Status$", "{}状态", "{}狀態"),
        (r"^(.+) Type$", "{}类型", "{}類型"),
    ]

    for pat, tmpl_cn, tmpl_tw in suffix_patterns:
        m = re.match(pat, text_clean)
        if m:
            sub = m.group(1).strip()
            sub_low = sub.lower()
            if sub_low in TERM_MAP:
                sub_cn, sub_tw = TERM_MAP[sub_low]
            else:
                sub_cn = sub
                sub_tw = sub
            return (tmpl_cn.format(sub_cn), tmpl_tw.format(sub_tw))

    # 4. 单术语直接映射
    if text_clean.lower() in TERM_MAP:
        return TERM_MAP[text_clean.lower()]

    return None

def main():
    with open('E:/antigravity2-cn-main/refined_ui_missing.json', 'r', encoding='utf-8') as f:
        missing_data = json.load(f)

    # 准备目标字典文件路径
    dicts_cn_dir = 'E:/antigravity2-cn-main/dicts'
    dicts_tw_dir = 'E:/antigravity2-cn-main/dicts_tw'

    # 分类映射到对应的 json 文件
    target_file_map = {
        "新增操作与按钮 (Buttons & Actions)": "common.json",
        "新增设置项与安全规则 (Settings & Security)": "page_settings.json",
        "新增智能体与模型管理 (Agents & Models)": "page_agents.json",
        "新增对话与上下文管理 (Chat & Context)": "common.json",
        "新增状态与通知 (Status & Alerts)": "common.json",
        "其他通用界面文本 (General UI)": "common.json"
    }

    # 读取原有字典内容
    existing_cn = {}
    existing_tw = {}
    for f in os.listdir(dicts_cn_dir):
        if f.endswith('.json'):
            with open(os.path.join(dicts_cn_dir, f), 'r', encoding='utf-8') as fp:
                existing_cn[f] = json.load(fp)
            tw_path = os.path.join(dicts_tw_dir, f)
            if os.path.exists(tw_path):
                with open(tw_path, 'r', encoding='utf-8') as fp:
                    existing_tw[f] = json.load(fp)
            else:
                existing_tw[f] = {}

    total_added = 0
    added_per_file = {}

    for cat_name, items in missing_data.items():
        target_json = target_file_map.get(cat_name, "common.json")
        if target_json not in added_per_file:
            added_per_file[target_json] = 0

        for item in items:
            item_clean = item.strip()
            # 如果已经存在，则不重复添加
            if item_clean in existing_cn[target_json]:
                continue

            trans = translate_phrase(item_clean)
            if trans:
                cn_val, tw_val = trans
                # 写入简体字典
                existing_cn[target_json][item_clean] = cn_val
                # 写入繁体字典
                existing_tw[target_json][item_clean] = tw_val
                total_added += 1
                added_per_file[target_json] += 1

    print(f"================ 增量翻译成果 ================")
    print(f"成功翻译并增补新词条总数: {total_added} 条")
    for f, count in added_per_file.items():
        print(f"  • {f:25s}: 新增 {count:4d} 条 (累计词条: {len(existing_cn[f])})")

    # 写回文件
    for f, d in existing_cn.items():
        p = os.path.join(dicts_cn_dir, f)
        with open(p, 'w', encoding='utf-8') as fp:
            json.dump(d, fp, ensure_ascii=False, indent=4)

    for f, d in existing_tw.items():
        p = os.path.join(dicts_tw_dir, f)
        with open(p, 'w', encoding='utf-8') as fp:
            json.dump(d, fp, ensure_ascii=False, indent=4)

    print("\n所有字典已同步写回磁盘！")

if __name__ == '__main__':
    main()
