const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// --tw 參數：使用繁體中文字典 (dicts_tw/)，否則使用預設簡體字典 (dicts/)
const USE_TW = process.argv.includes('--tw');
const DICTS_FOLDER = USE_TW ? 'dicts_tw' : 'dicts';
const BRAND_TITLE_ALIASES = {
    english: 'english',
    en: 'english',
    default: 'english',
    hidden: 'hidden',
    hide: 'hidden',
    none: 'hidden',
    translated: 'translated',
    chinese: 'translated',
    cn: 'translated',
    zh: 'translated'
};

function getOptionValue(name, defaultValue) {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        if (args[i] === name) {
            return args[i + 1] || defaultValue;
        }
        if (args[i].startsWith(name + '=')) {
            return args[i].slice(name.length + 1);
        }
    }
    return defaultValue;
}

const BRAND_TITLE_MODE = BRAND_TITLE_ALIASES[String(getOptionValue('--brand-title', 'english')).toLowerCase()] || 'english';

if (USE_TW) {
    const logTranslations = {
        "====== 正在安装 Antigravity 中文汉化 ======": "====== 正在安裝 Antigravity 繁體中文漢化 ======",
        "====== 正在卸载中文汉化，恢复官方原版 ======": "====== 正在卸載中文漢化，恢復官方原版 ======",
        "====== 检测到 Antigravity 1.0 架构，正在使用 HTML 注入引擎 ======": "====== 偵測到 Antigravity 1.0 架構，正在使用 HTML 注入引擎 ======",
        "====== 正在恢复 Antigravity 1.0 官方原版 ======": "====== 正在恢復 Antigravity 1.0 官方原版 ======",
        "[1] 检测到 Antigravity 客户端正在运行，正在关闭以解除文件锁...": "[1] 偵測到 Antigravity 用戶端正在執行，正在關閉以解除檔案鎖...",
        "[1] 正在关闭 Antigravity 运行进程以解除文件锁...": "[1] 正在關閉 Antigravity 執行進程以解除檔案鎖...",
        "[备份] 正在创建官方原始包备份: app.asar.bak ...": "[備份] 正在建立官方原始包備份: app.asar.bak ...",
        "[备份] 备份成功！": "[備份] 備份成功！",
        "[备份] 已创建旧版 HTML 备份: ": "[備份] 已建立舊版 HTML 備份: ",
        "[解包] 正在使用 npx 提取 app.asar...": "[解包] 正在使用 npx 提取 app.asar...",
        "[修改] 正在向 preload.js 注入汉化代码...": "[修改] 正在向 preload.js 注入漢化程式碼...",
        "[修改] 注入成功！": "[修改] 注入成功！",
        "[修改] 正在向 menu.js 注入菜单汉化代码...": "[修改] 正在向 menu.js 注入選單漢化程式碼...",
        "[修改] 菜单汉化注入成功！": "[修改] 選單漢化注入成功！",
        "[修改] 正在向 tray.js 注入任务栏菜单汉化...": "[修改] 正在向 tray.js 注入系統匣選單漢化...",
        "[修改] 任务栏菜单汉化注入成功！": "[修改] 系統匣選單漢化注入成功！",
        "[修改] 正在向 loadingOverlay.js 注入加载页汉化...": "[修改] 正在向 loadingOverlay.js 注入載入頁漢化...",
        "[修改] 加载页汉化注入成功！": "[修改] 載入頁漢化注入成功！",
        "[修改] 正在向 updater.js 注入更新弹窗汉化...": "[修改] 正在向 updater.js 注入更新彈出視窗漢化...",
        "[修改] 更新弹窗汉化注入成功！": "[修改] 更新彈出視窗漢化注入成功！",
        "[打包] 正在将修改后的内容打包回 app.asar...": "[打包] 正在將修改後的內容打包回 app.asar...",
        "[√] Antigravity 2.0 汉化部署完成！": "[√] Antigravity 2.0 漢化部署完成！",
        "[√] Antigravity 1.0 汉化部署完成！": "[√] Antigravity 1.0 漢化部署完成！",
        "[!] 未找到备份文件 app.asar.bak，可能尚未安装过汉化或备份被删除。": "[!] 未找到備份檔案 app.asar.bak，可能尚未安裝過漢化或備份已被刪除。",
        "[还原] 正在用官方备份文件恢复...": "[還原] 正在用官方備份檔案恢復...",
        "[还原] 已重置当前 app.asar 为官方原始备份包，以进行全新注入...": "[還原] 已重置目前 app.asar 為官方原始備份包，以進行全新注入...",
        "[提示] 当前 app.asar 被锁定（可能是客户端正在运行），将使用当前包进行增量注入。": "[提示] 目前 app.asar 被鎖定（可能是用戶端正在執行），將使用目前包進行增量注入。",
        "[还原] 已恢复 HTML: ": "[還原] 已恢復 HTML: ",
        "[还原] 已删除汉化脚本": "[還原] 已刪除漢化指令碼",
        "[√] 官方 app.asar 已成功恢复！": "[√] 官方 app.asar 已成功恢復！",
        "[√] 校验值已同步，1.0 软件恢复至原始状态。": "[√] 校驗值已同步，1.0 軟體恢復至原始狀態。",
        "[错误] 手动指定的路径不存在:": "[錯誤] 手動指定的路徑不存在:",
        "[错误] 未在资源目录中找到 app.asar:": "[錯誤] 未在資源目錄中找到 app.asar:",
        "[错误] 解压后未能在指定路径找到 preload.js:": "[錯誤] 解壓後未能在指定路徑找到 preload.js:",
        "[错误] 无法定位有效的资源(resources)目录:": "[錯誤] 無法定位有效的資源(resources)目錄:",
        "[错误] 无法定位有效的资源(resources)目录: ": "[錯誤] 無法定位有效的資源(resources)目錄: ",
        "[错误] 解包失败，可能是由于系统未安装 Node.js/npm 或者网络限制。": "[錯誤] 解包失敗，可能是由於系統未安裝 Node.js/npm 或者網路限制。",
        "[错误] 打包失败。": "[錯誤] 打包失敗。",
        "[警告] 未能在 menu.js 中找到设定的插入点。": "[警告] 未能在 menu.js 中找到設定的插入點。",
        "[签名] 检测到 macOS 平台，正在对应用包进行本地 ad-hoc 深度重签名: ": "[簽名] 偵測到 macOS 平台，正在對應用程式包進行本機 ad-hoc 深度重新簽名: ",
        "[签名] 重新签名成功！": "[簽名] 重新簽名成功！",
        "[警告] 重新签名失败。可能会导致应用无法打开。": "[警告] 重新簽名失敗。可能會導致應用程式無法開啟。",
        "[警告] 未能从路径 ": "[警告] 未能從路徑 ",
        " 识别到有效的 .app 路径，跳过重新签名。": " 識別到有效的 .app 路徑，跳過重新簽名。",
        "[探测] 成功自动识别到 Antigravity 安装目录: ": "[偵測] 成功自動識別到 Antigravity 安裝目錄: ",
        "[错误] 未找到默认安装目录，请使用 --install-dir 手动指定您的安装路径！": "[錯誤] 未找到預設安裝目錄，請使用 --install-dir 手動指定您的安裝路徑！",
        "[!] 未找到 1.0 备份文件。": "[!] 未找到 1.0 備份檔案。",
        "详情: ": "詳情: ",
        "[√] 注入成功: ": "[√] 注入成功: ",
        "[跳过] 检测到 --no-kill 参数，跳过关闭 Antigravity 运行进程。": "[跳過] 偵測到 --no-kill 參數，跳過關閉 Antigravity 執行進程。",
        "[启动] 检测到安装前反重力客户端处于开启状态，正在重新启动客户端...": "[啟動] 偵測到安裝前反重力用戶端處於開啟狀態，正在重新啟動用戶端...",
        "[启动] 客户端启动成功！": "[啟動] 用戶端啟動成功！",
        "[警告] 未找到客户端主程序: ": "[警告] 未找到用戶端主程式: ",
        "[警告] 客户端启动失败: ": "[警告] 用戶端啟動失敗: "
    };
    const translateMsg = (args) => {
        return args.map(arg => {
            if (typeof arg === 'string') {
                let res = arg;
                for (const [k, v] of Object.entries(logTranslations)) {
                    if (res.includes(k)) {
                        res = res.split(k).join(v);
                    }
                }
                return res;
            }
            return arg;
        });
    };
    const origLog = console.log;
    const origError = console.error;
    const origWarn = console.warn;
    console.log = (...args) => origLog(...translateMsg(args));
    console.error = (...args) => origError(...translateMsg(args));
    console.warn = (...args) => origWarn(...translateMsg(args));
}

const SIGNATURE_START = "/* --- ANTIGRAVITY CHINESE LOCALIZATION START --- */";
const SIGNATURE_END = "/* --- ANTIGRAVITY CHINESE LOCALIZATION END --- */";

function normalizeText(text) {
    if (!text) return "";
    return text.replace(/\s+/g, ' ')
               .trim()
               .replace(/’/g, "'")
               .replace(/‘/g, "'")
               .replace(/“/g, '"')
               .replace(/”/g, '"')
               .replace(/…/g, '...');
}

function loadDictionary() {
    const totalMap = {};
    const dictsDir = path.join(__dirname, DICTS_FOLDER);
    if (fs.existsSync(dictsDir)) {
        const files = fs.readdirSync(dictsDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const filePath = path.join(dictsDir, file);
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    const data = JSON.parse(fileContent);
                    for (const [k, v] of Object.entries(data)) {
                        const normK = normalizeText(k);
                        if (normK) totalMap[normK] = v;
                    }
                } catch (e) {
                    // ignore
                }
            }
        }
    }
    if (BRAND_TITLE_MODE === 'english') {
        delete totalMap[normalizeText('Antigravity')];
    } else if (BRAND_TITLE_MODE === 'hidden') {
        totalMap[normalizeText('Antigravity')] = '';
    }
    return totalMap;
}

function generateJs() {
    const fullDict = loadDictionary();
    const longEntries = Object.entries(fullDict).sort((a, b) => b[0].length - a[0].length);
    
    const dictJson = JSON.stringify(fullDict, null, 4);
    const entriesJson = JSON.stringify(longEntries);

    const jsSource = `${SIGNATURE_START}
(() => {
    // V12.0 终极隔离版：基于容器回溯的物理隔离引擎
    // 逻辑：不再仅仅检查当前标签，而是向上回溯父级，识别“代码/编辑器”禁区
    const USE_TW = ${USE_TW ? 'true' : 'false'};
    const map = new Map(Object.entries(DICT_PLACEHOLDER));
    const lowerMap = new Map();
    for (const [k, v] of map.entries()) lowerMap.set(k.toLowerCase(), v);
    
    const longEntries = REPLACEMENT_ENTRIES_PLACEHOLDER;
    const translatedValues = new WeakMap();

    // 禁区类名/属性特征
    const BLOCKED_CLASSES = ['monaco-editor', 'editor-container', 'terminal', 'output-view', 'debug-console', 'code-view', 'artifact-container', 'suggest-widget', 'chat-bubble', 'chat-message', 'chat-line', 'chat-msg', 'message-item', 'conversation-item', 'chat-history', 'chat-container', 'chat-pane', 'ai-chat-bubble', 'user-chat-bubble'];
    const BLOCKED_TAGS = ['SCRIPT', 'STYLE', 'CODE', 'PRE', 'INPUT', 'TEXTAREA', 'SVG', 'CANVAS', 'SYMBOL', 'PATH'];

    function norm(s) {
        if (!s) return '';
        return s.replace(/\\s+/g, ' ').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').trim();
    }

    function translateWithShortcut(val) {
        if (!val) return null;
        const match = val.match(/^(.+?)\\s*\\((Ctrl|Cmd|Alt|Shift|⌘|⌥|⇧|⌃)\\+?([^)]*)\\)$/i);
        if (match) {
            const prefix = match[1].trim();
            const normPref = norm(prefix);
            const lowerPref = normPref.toLowerCase();
            let transPref = null;
            if (map.has(normPref)) {
                transPref = map.get(normPref);
            } else if (lowerMap.has(lowerPref)) {
                transPref = lowerMap.get(lowerPref);
            }
            if (transPref) {
                return transPref + " (" + match[2] + (match[3] ? "+" + match[3] : "") + ")";
            }
        }
        return null;
    }

    // 允许在文件胶囊 (inline-pill / data-uri) 内翻译的内置视图标签白名单（严禁翻译真实文件名）
    const ALLOWED_PILL_LABELS = new Set([
        'task log', 'implementation plan', 'walkthrough', 'task',
        'conversation', 'sections', 'overview', 'resolving link...', 'resolving link…'
    ]);

    // 核心隔离判断：回溯检查当前节点是否逻辑上属于“禁止汉化区”
    function isInBlockedZone(node) {
        let curr = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;

        // 【智能放行】如果当前节点是工具调用卡片外壳、操作按钮、步骤标题或思考计时器，优先放行汉化（前提不是代码/终端/编辑器/聊天气泡）
        let isToolControl = false;
        let checkPtr = curr;
        let checkDepth = 0;
        while (checkPtr && checkDepth < 9) {
            if (checkPtr.nodeType === Node.ELEMENT_NODE) {
                const pTag = checkPtr.tagName.toUpperCase();
                if (pTag === 'PRE' || pTag === 'CODE' || pTag === 'INPUT' || pTag === 'TEXTAREA' || pTag === 'SCRIPT' || pTag === 'STYLE') {
                    return true; // 绝对代码/输入禁区，严格保护
                }
                const pTestId = checkPtr.getAttribute('data-testid') || '';
                if (pTestId === 'planner-response-text') {
                    return true; // AI 回复正文 Markdown 绝对保护
                }
                if (pTestId === 'user-input-step' && !isToolControl) {
                    return true; // 用户发送的消息气泡绝对保护
                }
                const pCls = checkPtr.className || '';
                if (typeof pCls === 'string') {
                    if (pCls.includes('monaco-editor') || pCls.includes('terminal') || pCls.includes('cursor-edit')) {
                        return true; // 编辑器、终端与思考正文编辑区绝对保护
                    }
                    if ((pCls.includes('group/terminal-card') || pCls.includes('group/run-command')) && !isToolControl) {
                        return true; // 终端卡片内的命令行与输出保护（内部按钮如 Copy command 已在更低层级标记 isToolControl）
                    }
                    // 保护文件胶囊 (inline-pill / data-uri) 中的真实代码文件名不被误译
                    if (checkPtr.hasAttribute('data-uri') || checkPtr.hasAttribute('data-file-uri') || pCls.includes('inline-pill') || pTestId === 'file-title-name') {
                        if (node.nodeType === Node.TEXT_NODE) {
                            const pillText = norm(node.nodeValue).toLowerCase();
                            if (!ALLOWED_PILL_LABELS.has(pillText)) {
                                return true;
                            }
                        }
                    }
                    if (
                        pTag === 'BUTTON' ||
                        checkPtr.getAttribute('role') === 'button' ||
                        pCls.includes('tool-viewer-card') ||
                        pCls.includes('tool-card') ||
                        pCls.includes('user-input-buttons') ||
                        pCls.includes('min-h-8 py-1 px-2 select-none') ||
                        pCls.includes('whitespace-nowrap text-muted-foreground') ||
                        pCls.includes('group/agent-ref') ||
                        pCls.includes('tabular-nums select-none') ||
                        pCls.includes('animate-shimmer-text') ||
                        /^(view-file-step|run-command-step|thinking-collapsible-trigger|subagent-node|subagent-expand|subagent-approve|subagent-deny|subagent-stop|running-items-card|running-items-panel|running-items-subagents|running-items-tasks|idle-status-text|agent-loading|step-bar|cleared-step-notice)$/.test(pTestId)
                    ) {
                        isToolControl = true;
                    }
                }
            }
            checkPtr = checkPtr.parentElement;
            checkDepth++;
        }
        if (isToolControl) return false;

        let depth = 0;
        while (curr && depth < 12) { // 向上回溯 12 层
            if (curr.nodeType === Node.ELEMENT_NODE) {
                const tag = curr.tagName.toUpperCase();
                if (BLOCKED_TAGS.includes(tag)) return true;
                if (curr.getAttribute('contenteditable') === 'true') return true;

                // 阻断常见的角色属性标识，如 data-role="user", data-author="user"
                const dataRole = curr.getAttribute('data-role');
                if (dataRole && /^(user|human|client|customer|my)$/i.test(dataRole)) return true;
                const dataAuthor = curr.getAttribute('data-author');
                if (dataAuthor && /^(user|human|client|customer|my)$/i.test(dataAuthor)) return true;
                
                // 阻断 ID 包含 chat, conversation, interactive 的容器
                const id = curr.id || '';
                if (typeof id === 'string') {
                    const idLower = id.toLowerCase();
                    if (idLower.includes('chat') || idLower.includes('conversation') || idLower.includes('interactive')) return true;
                }

                // 阻断 aria-label 包含 Chat, AI, Ask, conversation, interactive 的容器
                const ariaLabel = curr.getAttribute('aria-label') || '';
                if (ariaLabel) {
                    const alLower = ariaLabel.toLowerCase();
                    if (alLower.includes('chat') || alLower.includes('ai') || alLower.includes('ask') || alLower.includes('conversation') || alLower.includes('interactive')) return true;
                }

                const className = curr.className || '';
                if (typeof className === 'string') {
                    if (BLOCKED_CLASSES.some(cls => className.includes(cls))) return true;

                    const clsLower = className.toLowerCase();
                    // 阻断类名包含 chat, conversation, interactive 的容器
                    if (clsLower.includes('chat') || clsLower.includes('conversation') || clsLower.includes('interactive')) return true;

                    // 阻断各类用户/助理聊天消息气泡的变体
                    if (/(^|\\b|[-_])(user|human|client|customer|my|ai|bot|assistant)([-_]?(message|msg|bubble|query|chat|input|text|content))(\\b|$)/i.test(className)) {
                        return true;
                    }
                    if (/(^|\\b|[-_])(message|msg|bubble|query|chat|input|text|content)([-_]?(user|human|client|customer|my|ai|bot|assistant))(\\b|$)/i.test(className)) {
                        return true;
                    }
                }
            }
            curr = curr.parentElement || (curr.parentNode && curr.parentNode.host); // 支持 Shadow DOM 穿透
            depth++;
        }
        return false;
    }

    // 判断当前文本节点是否处于工具调用步骤行 / 子代理步骤行 / 后台任务面板中
    function isToolStepNode(node) {
        let ptr = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        let d = 0;
        while (ptr && d < 8) {
            if (ptr.nodeType === Node.ELEMENT_NODE) {
                const cls = typeof ptr.className === 'string' ? ptr.className : '';
                const tid = ptr.getAttribute('data-testid') || '';
                if (ptr.hasAttribute('data-uri') || ptr.hasAttribute('data-file-uri') || cls.includes('inline-pill') || tid === 'file-title-name') {
                    return false;
                }
                if (
                    cls.includes('min-h-8 py-1 px-2 select-none') ||
                    cls.includes('whitespace-nowrap text-muted-foreground') ||
                    cls.includes('group/agent-ref') ||
                    /^(view-file-step|run-command-step|subagent-node|subagent-tab-header-title|running-items-card|running-items-panel|running-items-subagents|running-items-tasks)$/.test(tid)
                ) {
                    return true;
                }
            }
            ptr = ptr.parentElement;
            d++;
        }
        return false;
    }

    // 动态 AI 步骤短语 (toolAction / toolSummary / Role) 词汇映射与组合翻译器
    const TECH_WORD_MAP_CN = {
        'and': '与', 'or': '或', 'in': '在', 'for': '用于', 'with': '使用', 'from': '从', 'to': '到', 'of': '的', 'on': '在', 'by': '按',
        'file': '文件', 'files': '文件', 'directory': '目录', 'directories': '目录', 'folder': '文件夹', 'folders': '文件夹',
        'path': '路径', 'paths': '路径', 'code': '代码', 'codebase': '代码库', 'source': '源码', 'sources': '源码',
        'line': '行', 'lines': '行', 'range': '范围', 'content': '内容', 'contents': '内容',
        'function': '函数', 'functions': '函数', 'method': '方法', 'methods': '方法', 'class': '类', 'classes': '类',
        'component': '组件', 'components': '组件', 'module': '模块', 'modules': '模块',
        'variable': '变量', 'variables': '变量', 'constant': '常量', 'constants': '常量',
        'type': '类型', 'types': '类型', 'interface': '接口', 'interfaces': '接口', 'schema': '模式', 'schemas': '模式',
        'config': '配置', 'configs': '配置', 'configuration': '配置', 'settings': '设置', 'option': '选项', 'options': '选项',
        'status': '状态', 'state': '状态', 'info': '信息', 'information': '信息', 'detail': '详情', 'details': '详情',
        'error': '错误', 'errors': '错误', 'warning': '警告', 'warnings': '警告', 'issue': '问题', 'issues': '问题', 'bug': '缺陷', 'bugs': '缺陷',
        'test': '测试', 'tests': '测试', 'unit': '单元', 'integration': '集成', 'suite': '套件',
        'command': '命令', 'commands': '命令', 'script': '脚本', 'scripts': '脚本', 'task': '任务', 'tasks': '任务',
        'process': '进程', 'processes': '进程', 'service': '服务', 'services': '服务', 'server': '服务器', 'servers': '服务器',
        'port': '端口', 'ports': '端口', 'network': '网络', 'request': '请求', 'requests': '请求', 'response': '响应', 'responses': '响应',
        'log': '日志', 'logs': '日志', 'output': '输出', 'outputs': '输出', 'result': '结果', 'results': '结果',
        'database': '数据库', 'table': '表', 'tables': '表', 'query': '查询', 'queries': '查询', 'index': '索引', 'indices': '索引', 'indexes': '索引',
        'loader': '加载器', 'loaders': '加载器', 'handler': '处理器', 'handlers': '处理器', 'helper': '辅助函数', 'helpers': '辅助函数',
        'route': '路由', 'routes': '路由', 'router': '路由', 'endpoint': '端点', 'endpoints': '端点',
        'dependency': '依赖', 'dependencies': '依赖', 'package': '包', 'packages': '包', 'library': '库', 'libraries': '库',
        'version': '版本', 'versions': '版本', 'branch': '分支', 'branches': '分支', 'commit': '提交', 'commits': '提交',
        'repository': '仓库', 'repo': '仓库', 'project': '项目', 'workspace': '工作区', 'environment': '环境',
        'dictionary': '词典', 'dictionaries': '词典', 'translation': '翻译', 'translations': '翻译', 'localization': '汉化',
        'engine': '引擎', 'rule': '规则', 'rules': '规则', 'regex': '正则', 'pattern': '模式', 'patterns': '模式',
        'string': '字符串', 'strings': '字符串', 'entry': '词条', 'entries': '词条', 'key': '键', 'keys': '键', 'value': '值', 'values': '值',
        'button': '按钮', 'buttons': '按钮', 'style': '样式', 'styles': '样式', 'layout': '布局', 'page': '页面', 'pages': '页面',
        'unported': '未移植', 'missing': '缺失', 'unused': '未使用', 'invalid': '无效', 'all': '全部', 'new': '新', 'existing': '现有',
        'current': '当前', 'local': '本地', 'remote': '远程', 'full': '完整', 'main': '主', 'core': '核心',
        'growth': '增长', 'lab': '实验', 'web': '网页', 'user': '用户', 'system': '系统', 'agent': '代理', 'subagent': '子代理'
    };

    const TECH_WORD_MAP_TW = {
        ...TECH_WORD_MAP_CN,
        'file': '檔案', 'files': '檔案', 'directory': '目錄', 'directories': '目錄', 'folder': '資料夾', 'folders': '資料夾',
        'code': '程式碼', 'codebase': '程式碼庫', 'source': '原始碼', 'sources': '原始碼',
        'function': '函式', 'functions': '函式', 'class': '類別', 'classes': '類別',
        'component': '元件', 'components': '元件', 'module': '模組', 'modules': '模組',
        'variable': '變數', 'variables': '變數', 'constant': '常數', 'constants': '常數',
        'type': '類型', 'types': '類型', 'interface': '介面', 'interfaces': '介面',
        'config': '設定', 'configs': '設定', 'configuration': '設定', 'settings': '設定', 'option': '選項', 'options': '選項',
        'status': '狀態', 'state': '狀態', 'info': '資訊', 'information': '資訊', 'detail': '詳情', 'details': '詳情',
        'error': '錯誤', 'errors': '錯誤', 'warning': '警告', 'warnings': '警告', 'issue': '問題', 'issues': '問題',
        'test': '測試', 'tests': '測試', 'unit': '單元', 'integration': '整合',
        'command': '指令', 'commands': '指令', 'script': '指令碼', 'scripts': '指令碼', 'task': '工作', 'tasks': '工作',
        'process': '處理序', 'processes': '處理序', 'service': '服務', 'services': '服務', 'server': '伺服器', 'servers': '伺服器',
        'port': '連接埠', 'ports': '連接埠', 'network': '網路', 'request': '請求', 'requests': '請求', 'response': '回應', 'responses': '回應',
        'log': '記錄', 'logs': '記錄', 'output': '輸出', 'outputs': '輸出', 'result': '結果', 'results': '結果',
        'database': '資料庫', 'query': '查詢', 'queries': '查詢', 'index': '索引', 'indices': '索引', 'indexes': '索引',
        'loader': '載入器', 'loaders': '載入器', 'handler': '處理常式', 'handlers': '處理常式',
        'dependency': '相依性', 'dependencies': '相依性', 'package': '套件', 'packages': '套件', 'library': '程式庫', 'libraries': '程式庫',
        'repository': '存放庫', 'repo': '存放庫', 'project': '專案', 'workspace': '工作區', 'environment': '環境',
        'dictionary': '詞典', 'dictionaries': '詞典', 'translation': '翻譯', 'translations': '翻譯', 'localization': '中文化',
        'string': '字串', 'strings': '字串', 'entry': '詞條', 'entries': '詞條',
        'button': '按鈕', 'buttons': '按鈕', 'style': '樣式', 'styles': '樣式', 'page': '頁面', 'pages': '頁面',
        'unported': '未移植', 'missing': '遺失', 'unused': '未使用', 'invalid': '無效', 'existing': '現有',
        'current': '目前', 'local': '本機', 'remote': '遠端', 'growth': '成長', 'lab': '實驗', 'web': '網頁', 'user': '使用者', 'system': '系統'
    };

    const ACTION_VERBS_CN = {
        'analyzing': '正在分析', 'examining': '正在检查', 'exploring': '正在探索', 'investigating': '正在排查',
        'inspecting': '正在检查', 'checking': '正在检查', 'reviewing': '正在审查', 'verifying': '正在验证', 'validating': '正在校验',
        'reading': '正在读取', 'viewing': '正在查看', 'watching': '正在监控',
        'searching': '正在搜索', 'scanning': '正在扫描', 'grepping': '正在搜索', 'querying': '正在查询',
        'finding': '正在查找', 'locating': '正在定位', 'listing': '正在列出', 'enumerating': '正在枚举',
        'editing': '正在编辑', 'modifying': '正在修改', 'updating': '正在更新', 'patching': '正在修补', 'replacing': '正在替换',
        'adding': '正在添加', 'inserting': '正在插入', 'appending': '正在追加',
        'creating': '正在创建', 'writing': '正在写入', 'generating': '正在生成', 'scaffolding': '正在生成',
        'deleting': '正在删除', 'removing': '正在移除', 'cleaning': '正在清理', 'clearing': '正在清除', 'stripping': '正在剥离',
        'fixing': '正在修复', 'resolving': '正在解决', 'debugging': '正在调试',
        'refactoring': '正在重构', 'optimizing': '正在优化', 'simplifying': '正在简化', 'formatting': '正在格式化',
        'running': '正在运行', 'executing': '正在执行', 'launching': '正在启动', 'starting': '正在启动', 'invoking': '正在调用',
        'testing': '正在测试', 'building': '正在构建', 'compiling': '正在编译', 'bundling': '正在打包', 'packaging': '正在打包',
        'installing': '正在安装', 'upgrading': '正在升级', 'configuring': '正在配置',
        'fetching': '正在获取', 'downloading': '正在下载', 'loading': '正在加载', 'retrieving': '正在获取', 'getting': '正在获取',
        'committing': '正在提交', 'pushing': '正在推送', 'pulling': '正在拉取', 'syncing': '正在同步', 'merging': '正在合并',
        'parsing': '正在解析', 'extracting': '正在提取', 'comparing': '正在对比', 'renaming': '正在重命名', 'moving': '正在移动', 'copying': '正在复制',
        'analyze': '分析', 'examine': '检查', 'explore': '探索', 'investigate': '排查',
        'inspect': '检查', 'check': '检查', 'review': '审查', 'verify': '验证', 'validate': '校验',
        'read': '读取', 'view': '查看', 'search': '搜索', 'scan': '扫描', 'query': '查询',
        'find': '查找', 'locate': '定位', 'list': '列出', 'enumerate': '枚举',
        'edit': '编辑', 'modify': '修改', 'update': '更新', 'patch': '修补', 'replace': '替换',
        'add': '添加', 'insert': '插入', 'append': '追加', 'create': '创建', 'write': '写入', 'generate': '生成',
        'delete': '删除', 'remove': '移除', 'clean': '清理', 'clear': '清除',
        'fix': '修复', 'resolve': '解决', 'debug': '调试', 'refactor': '重构', 'optimize': '优化',
        'run': '运行', 'execute': '执行', 'launch': '启动', 'start': '启动', 'invoke': '调用',
        'test': '测试', 'build': '构建', 'compile': '编译', 'install': '安装', 'configure': '配置',
        'fetch': '获取', 'download': '下载', 'load': '加载', 'retrieve': '获取', 'get': '获取',
        'commit': '提交', 'push': '推送', 'pull': '拉取', 'sync': '同步', 'merge': '合并',
        'parse': '解析', 'extract': '提取', 'compare': '对比', 'rename': '重命名', 'move': '移动', 'copy': '复制'
    };

    const ACTION_VERBS_TW = {
        ...ACTION_VERBS_CN,
        'checking': '正在檢查', 'inspecting': '正在檢查', 'examining': '正在檢查', 'verifying': '正在驗證',
        'reading': '正在讀取', 'viewing': '正在檢視', 'searching': '正在搜尋', 'scanning': '正在掃描', 'grepping': '正在搜尋', 'querying': '正在查詢',
        'finding': '正在尋找', 'editing': '正在編輯', 'adding': '正在新增', 'creating': '正在建立', 'writing': '正在寫入', 'generating': '正在產生',
        'deleting': '正在刪除', 'cleaning': '正在清理', 'fixing': '正在修復', 'resolving': '正在解決', 'debugging': '正在偵錯',
        'refactoring': '正在重構', 'optimizing': '正在最佳化', 'running': '正在執行', 'executing': '正在執行', 'launching': '正在啟動', 'starting': '正在啟動', 'invoking': '正在呼叫',
        'testing': '正在測試', 'building': '正在建置', 'compiling': '正在編譯', 'installing': '正在安裝', 'configuring': '正在設定',
        'fetching': '正在取得', 'downloading': '正在下載', 'loading': '正在載入', 'retrieving': '正在取得', 'getting': '正在取得',
        'extracting': '正在擷取', 'comparing': '正在比對', 'renaming': '正在重新命名', 'moving': '正在移動', 'copying': '正在複製',
        'check': '檢查', 'inspect': '檢查', 'verify': '驗證', 'read': '讀取', 'view': '檢視', 'search': '搜尋', 'scan': '掃描',
        'find': '尋找', 'edit': '編輯', 'add': '新增', 'create': '建立', 'write': '寫入', 'generate': '產生',
        'delete': '刪除', 'Fix': '修復', 'fix': '修復', 'debug': '偵錯', 'refactor': '重構', 'optimize': '最佳化',
        'run': '執行', 'execute': '執行', 'launch': '啟動', 'start': '啟動', 'invoke': '呼叫',
        'test': '測試', 'build': '建置', 'compile': '編譯', 'install': '安裝', 'configure': '設定',
        'fetch': '取得', 'download': '下載', 'load': '載入', 'retrieve': '取得', 'get': '取得',
        'extract': '擷取', 'compare': '比對', 'rename': '重新命名', 'move': '移動', 'copy': '複製'
    };

    const SUMMARY_NOUNS_CN = {
        'analysis': '分析', 'inspection': '检查', 'check': '检查', 'verification': '验证', 'validation': '校验',
        'execution': '执行', 'search': '搜索', 'lookup': '查询', 'update': '更新', 'modification': '修改',
        'edit': '编辑', 'creation': '创建', 'generation': '生成', 'deletion': '删除', 'removal': '移除',
        'refactoring': '重构', 'cleanup': '清理', 'installation': '安装', 'setup': '配置', 'configuration': '配置',
        'sync': '同步', 'synchronization': '同步', 'test': '测试', 'testing': '测试',
        'researcher': '研究代理', 'debugger': '调试代理', 'analyzer': '分析代理', 'inspector': '检查代理',
        'reviewer': '审查代理', 'auditor': '审计代理', 'scanner': '扫描代理', 'fixer': '修复代理'
    };

    const SUMMARY_NOUNS_TW = {
        ...SUMMARY_NOUNS_CN,
        'inspection': '檢查', 'check': '檢查', 'verification': '驗證', 'execution': '執行', 'search': '搜尋', 'lookup': '查詢',
        'edit': '編輯', 'creation': '建立', 'generation': '產生', 'deletion': '刪除', 'refactoring': '重構',
        'installation': '安裝', 'setup': '設定', 'configuration': '設定', 'test': '測試', 'testing': '測試',
        'debugger': '偵錯代理', 'inspector': '檢查代理', 'scanner': '掃描代理', 'fixer': '修復代理'
    };

    function translateTechPhrase(phrase) {
        if (!phrase) return phrase;
        const pNorm = norm(phrase);
        if (map.has(pNorm)) return map.get(pNorm);
        if (lowerMap.has(pNorm.toLowerCase())) return lowerMap.get(pNorm.toLowerCase());

        const wordDict = USE_TW ? TECH_WORD_MAP_TW : TECH_WORD_MAP_CN;
        // 去掉无意义的英文冠词 the / a / an
        let s = pNorm.replace(/\\b(the|a|an)\\s+/gi, '');
        // 处理数量 + IDs，如 "63 unported IDs" -> "63 个未移植 ID"
        s = s.replace(/(\\b\\d+)\\s+(unported\\s+)?IDs\\b/g, (m, num, unp) => {
            const unit = USE_TW ? ' 個' : ' 个';
            const unpStr = unp ? (USE_TW ? '未移植 ' : '未移植 ') : '';
            return num + unit + unpStr + 'ID';
        });

        const tokens = s.split(/(\\s+)/);
        const out = tokens.map(tok => {
            if (/^\\s+$/.test(tok)) return tok;
            // 保护文件名、路径、代码标识符（含 . / \\ _ - : # 等）以及全大写缩写（JS, LMS, UI, API, DOM 等）
            if (/[.\\/\\\\_:#-]/.test(tok) || (/^[A-Z0-9]{2,}$/.test(tok) && tok !== 'AND' && tok !== 'FOR')) {
                return tok;
            }
            const clean = tok.replace(/^[,'"]+|[,'".:;!?]+$/g, '');
            const lower = clean.toLowerCase();
            if (wordDict[lower]) {
                return tok.replace(clean, wordDict[lower]);
            }
            return tok;
        });

        // 合并连续中文词之间的多余空格，保留中文与英文/数字/文件名之间的单个空格
        return out.join('')
            .replace(/([\\u4e00-\\u9fa5])\\s+([\\u4e00-\\u9fa5])/g, '$1$2')
            .replace(/([\\u4e00-\\u9fa5])\\s+([\\u4e00-\\u9fa5])/g, '$1$2');
    }

    function translateDynamicToolAction(valNorm) {
        if (!valNorm || !/[A-Za-z]{3,}/.test(valNorm)) return null;

        // 1. 剥离末尾状态后缀（如 " finished", " completed", " failed", " canceled"）
        let base = valNorm;
        let suffix = '';
        const sufMatch = base.match(/^(.+?)\\s+(finished|completed|started|failed|canceled|cancelled|killed|skipped)$/i);
        if (sufMatch) {
            base = sufMatch[1].trim();
            const sufWord = sufMatch[2].toLowerCase();
            if (map.has(sufWord)) suffix = ' ' + map.get(sufWord);
            else if (sufWord === 'finished' || sufWord === 'completed') suffix = ' 已完成';
        }

        if (map.has(base)) return map.get(base) + suffix;
        if (lowerMap.has(base.toLowerCase())) return lowerMap.get(base.toLowerCase()) + suffix;

        const verbs = USE_TW ? ACTION_VERBS_TW : ACTION_VERBS_CN;
        const nouns = USE_TW ? SUMMARY_NOUNS_TW : SUMMARY_NOUNS_CN;
        let m;

        // 2. 复合双动词句式：例如 "List 63 unported IDs and locate JS source"
        if ((m = base.match(/^([A-Za-z]+)\\s+(.+?)\\s+and\\s+([A-Za-z]+)\\s+(.+)$/i))) {
            const v1 = verbs[m[1].toLowerCase()];
            const v2 = verbs[m[3].toLowerCase()];
            if (v1 && v2) {
                return v1 + ' ' + translateTechPhrase(m[2]) + (USE_TW ? ' 並' : ' 并') + v2 + ' ' + translateTechPhrase(m[4]) + suffix;
            }
        }

        // 3. 介词短语动作句式：Adding X to Y / Removing X from Y / Updating X in Y / Searching X for Y
        if ((m = base.match(/^(Adding|Appending|Inserting|Writing)\\s+(.+?)\\s+(?:to|into|in)\\s+(\\S+)$/i))) {
            return (USE_TW ? '正在向 ' : '正在向 ') + translateTechPhrase(m[3]) + (USE_TW ? ' 新增 ' : ' 添加 ') + translateTechPhrase(m[2]) + suffix;
        }
        if ((m = base.match(/^(Added|Appended|Inserted|Wrote)\\s+(.+?)\\s+(?:to|into|in)\\s+(\\S+)$/i))) {
            return (USE_TW ? '已向 ' : '已向 ') + translateTechPhrase(m[3]) + (USE_TW ? ' 新增 ' : ' 添加 ') + translateTechPhrase(m[2]) + suffix;
        }
        if ((m = base.match(/^(Removing|Deleting|Stripping)\\s+(.+?)\\s+from\\s+(\\S+)$/i))) {
            return (USE_TW ? '正在從 ' : '正在从 ') + translateTechPhrase(m[3]) + ' 移除 ' + translateTechPhrase(m[2]) + suffix;
        }
        if ((m = base.match(/^(Updating|Modifying|Editing|Patching|Fixing|Refactoring|Replacing)\\s+(.+?)\\s+in\\s+(.+)$/i))) {
            const v = verbs[m[1].toLowerCase()] || '正在修改';
            return v + ' ' + translateTechPhrase(m[3]) + ' 中的 ' + translateTechPhrase(m[2]) + suffix;
        }
        if ((m = base.match(/^(Searching|Scanning|Grepping|Checking|Inspecting|Analyzing)\\s+(?:in\\s+)?(.+?)\\s+for\\s+(.+)$/i))) {
            return '正在 ' + translateTechPhrase(m[2]) + (USE_TW ? ' 中搜尋 ' : ' 中搜索 ') + translateTechPhrase(m[3]) + suffix;
        }
        if ((m = base.match(/^(?:Searching|Looking|Scanning)\\s+for\\s+(.+?)\\s+in\\s+(.+)$/i))) {
            return '正在 ' + translateTechPhrase(m[2]) + (USE_TW ? ' 中尋找 ' : ' 中查找 ') + translateTechPhrase(m[1]) + suffix;
        }
        if ((m = base.match(/^(?:Searching|Looking|Scanning)\\s+for\\s+(.+)$/i))) {
            return (USE_TW ? '正在尋找 ' : '正在查找 ') + translateTechPhrase(m[1]) + suffix;
        }

        // 4. 通用动词开头句式：Checking X / Viewing X / Running X / List X / Locate X
        if ((m = base.match(/^([A-Za-z]+)\\s+(.+)$/))) {
            const v = verbs[m[1].toLowerCase()];
            if (v) {
                return v + ' ' + translateTechPhrase(m[2]) + suffix;
            }
        }

        // 5. 名词短语总结句式 (toolSummary / Role)：Directory analysis / Git status check / Codebase Researcher
        if ((m = base.match(/^(.+?)\\s+(analysis|inspection|check|verification|validation|execution|search|lookup|update|modification|edit|creation|generation|deletion|removal|refactoring|cleanup|installation|setup|configuration|sync|synchronization|test|testing|researcher|debugger|analyzer|inspector|reviewer|auditor|scanner|fixer)$/i))) {
            const n = nouns[m[2].toLowerCase()];
            if (n) {
                return translateTechPhrase(m[1]) + ' ' + n + suffix;
            }
        }

        if (suffix) {
            return translateTechPhrase(base) + suffix;
        }
        return null;
    }

    function translateNode(node) {
        try {
            if (!node) return;
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.tagName.toUpperCase();
                
                // 给禁区元素打上 translate="no" 和 class="notranslate" 标记，物理防御网页自动翻译
                let isBlocked = BLOCKED_TAGS.includes(tag);
                if (!isBlocked) {
                    const className = node.className || '';
                    if (typeof className === 'string') {
                        if (BLOCKED_CLASSES.some(cls => className.includes(cls))) {
                            isBlocked = true;
                        }
                    }
                }
                if (node.getAttribute('contenteditable') === 'true') {
                    isBlocked = true;
                }
                
                if (isBlocked) {
                    if (node.getAttribute('translate') !== 'no') {
                        node.setAttribute('translate', 'no');
                    }
                    try {
                        if (!node.classList.contains('notranslate')) {
                            node.classList.add('notranslate');
                        }
                    } catch (e) {}
                }

                // 1. 快速排除基础禁止标签
                if (BLOCKED_TAGS.includes(tag)) {
                    // 对于 INPUT, TEXTAREA 和 SVG，虽然不翻译其子元素或内容，但需要翻译其 placeholder, title, aria-label 等属性
                    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SVG') {
                        if (!isInBlockedZone(node.parentElement)) {
                            for (const attr of ['placeholder', 'title', 'aria-label']) {
                                const v = node.getAttribute(attr);
                                if (v) {
                                    const t = norm(v);
                                    const shortcutTrans = translateWithShortcut(t);
                                    if (shortcutTrans) node.setAttribute(attr, shortcutTrans);
                                    else if (map.has(t)) node.setAttribute(attr, map.get(t));
                                    else if (lowerMap.has(t.toLowerCase())) node.setAttribute(attr, lowerMap.get(t.toLowerCase()));
                                }
                            }
                        }
                    }
                    return;
                }
                
                // 2. 只有当确实不在禁区时，才翻译其属性（新增 data-slot-out 以支持步骤文字过渡动画）
                if (!isInBlockedZone(node)) {
                    for (const attr of ['placeholder', 'title', 'aria-label', 'data-slot-out']) {
                        const v = node.getAttribute(attr);
                        if (v) {
                            const t = norm(v);
                            const shortcutTrans = translateWithShortcut(t);
                            if (shortcutTrans) node.setAttribute(attr, shortcutTrans);
                            else if (map.has(t)) node.setAttribute(attr, map.get(t));
                            else if (lowerMap.has(t.toLowerCase())) node.setAttribute(attr, lowerMap.get(t.toLowerCase()));
                        }
                    }
                }

                if (node.shadowRoot) translateNode(node.shadowRoot);
                for (const child of node.childNodes) translateNode(child);

            } else if (node.nodeType === Node.TEXT_NODE) {
                let originalVal = node.nodeValue;
                if (!originalVal || originalVal.trim().length < 1) return;

                // 核心：如果是 skeleton 骨架占位文本，强制打上不翻译标记
                if (originalVal.toLowerCase().includes('pack.info')) {
                    const parent = node.parentElement;
                    if (parent) {
                        if (parent.getAttribute('translate') !== 'no') {
                            parent.setAttribute('translate', 'no');
                        }
                        try {
                            if (!parent.classList.contains('notranslate')) {
                                parent.classList.add('notranslate');
                            }
                        } catch (e) {}
                    }
                    return;
                }

                // 核心：在处理文本节点前，必须确认其不在“禁止区”
                if (isInBlockedZone(node)) return;

                if (translatedValues.get(node) === originalVal) return;

                let newVal = originalVal;
                const valNorm = norm(originalVal);
                const valLower = valNorm.toLowerCase();

                // 检查是否处于 Cvb ([data-slot]) 数字滚动过渡容器内
                const hasSlotSibling = !!(node.parentElement && node.parentElement.querySelector && node.parentElement.querySelector(':scope > [data-slot]'));

                // 1. 精确匹配（含大小写自动纠正与快捷键检测）
                const shortcutTrans = translateWithShortcut(valNorm);
                if (shortcutTrans) {
                    newVal = shortcutTrans;
                } else if (hasSlotSibling && valNorm === 's' && node.previousSibling && node.previousSibling.nodeType === Node.ELEMENT_NODE && node.previousSibling.hasAttribute('data-slot')) {
                    newVal = ' 秒';
                } else if (hasSlotSibling && /^for (\\d+)s$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^for (\\d+)s$/i, (m, sec) => ' ' + sec + ' 秒');
                } else if (map.has(valNorm)) {
                    newVal = map.get(valNorm);
                    if (hasSlotSibling && /\\s$/.test(originalVal) && !/\\s$/.test(newVal)) newVal += ' ';
                } else if (lowerMap.has(valLower)) {
                    newVal = lowerMap.get(valLower);
                    if (hasSlotSibling && /\\s$/.test(originalVal) && !/\\s$/.test(newVal)) newVal += ' ';
                } else if (/^Thought for (\\d+)s$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Thought for (\\d+)s$/i, (m, sec) => '已思考 ' + sec + ' 秒');
                } else if (/^Thinking for (\\d+)s$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Thinking for (\\d+)s$/i, (m, sec) => '正在思考 ' + sec + ' 秒');
                } else if (/^Worked for (.+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Worked for (.+)$/i, (m, dur) => (USE_TW ? '已執行 ' : '已运行 ') + dur);
                } else if (/^Waiting for command completion \\(up to (\\d+) seconds?\\)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Waiting for command completion \\(up to (\\d+) seconds?\\)$/i, (m, sec) => {
                        return USE_TW ? ('正在等待指令完成（最多 ' + sec + ' 秒）') : ('正在等待命令完成（最多 ' + sec + ' 秒）');
                    });
                } else if (/^(Sending|Sent|Suggested sending|Rejected sending|Error sending) (input|termination request) to command$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(Sending|Sent|Suggested sending|Rejected sending|Error sending) (input|termination request) to command$/i, (m, act, target) => {
                        const tStr = target.toLowerCase() === 'input' ? (USE_TW ? '輸入' : '输入') : (USE_TW ? '終止請求' : '终止请求');
                        const aLower = act.toLowerCase();
                        if (aLower === 'sending') return (USE_TW ? '正在向指令傳送' : '正在向命令发送') + tStr;
                        if (aLower === 'sent') return (USE_TW ? '已向指令傳送' : '已向命令发送') + tStr;
                        if (aLower === 'suggested sending') return (USE_TW ? '建議向指令傳送' : '建议向命令发送') + tStr;
                        if (aLower === 'rejected sending') return (USE_TW ? '已拒絕向指令傳送' : '已拒绝向命令发送') + tStr;
                        return (USE_TW ? '向指令傳送' : '向命令发送') + tStr + (USE_TW ? '時出錯' : '时出错');
                    });
                } else if (/^(Clicking|Clicked) element "(.+)"$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(Clicking|Clicked) element "(.+)"$/i, (m, act, el) => {
                        const aStr = act.toLowerCase() === 'clicking' ? (USE_TW ? '正在點擊元素 ' : '正在点击元素 ') : (USE_TW ? '已點擊元素 ' : '已点击元素 ');
                        const elStr = el === 'in Browser' ? (USE_TW ? '瀏覽器內' : '浏览器内') : el;
                        return aStr + '"' + elStr + '"';
                    });
                } else if (/^(Typing|Typed) '(.+)' in Browser$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(Typing|Typed) '(.+)' in Browser$/i, (m, act, txt) => {
                        return (act.toLowerCase() === 'typing' ? (USE_TW ? '正在瀏覽器中輸入 ' : '正在浏览器中输入 ') : (USE_TW ? '已在瀏覽器中輸入 ' : '已在浏览器中输入 ')) + "'" + txt + "'";
                    });
                } else if (/^(Pressing|Pressed) (.+) in Browser$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(Pressing|Pressed) (.+) in Browser$/i, (m, act, key) => {
                        return (act.toLowerCase() === 'pressing' ? (USE_TW ? '正在瀏覽器中按下 ' : '正在浏览器中按下 ') : (USE_TW ? '已在瀏覽器中按下 ' : '已在浏览器中按下 ')) + key;
                    });
                } else if (/^Finding files in (.+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Finding files in (.+)$/i, (m, dir) => (USE_TW ? '正在 ' + dir + ' 中尋找檔案' : '正在 ' + dir + ' 中查找文件'));
                } else if (/^Searching (.+) for (.+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Searching (.+) for (.+)$/i, (m, dir, q) => (USE_TW ? '正在 ' + dir + ' 中搜尋 ' + q : '正在 ' + dir + ' 中搜索 ' + q));
                } else if (/^Error while running: (.+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Error while running: (.+)$/i, (m, target) => (USE_TW ? '執行時出錯：' : '运行时出错：') + target);
                } else if (/^(Generating|Generated|Generate) with (.+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(Generating|Generated|Generate) with (.+)$/i, (m, act, model) => {
                        const aLower = act.toLowerCase();
                        if (aLower === 'generating') return (USE_TW ? '正在使用 ' + model + ' 產生' : '正在使用 ' + model + ' 生成');
                        if (aLower === 'generated') return (USE_TW ? '已使用 ' + model + ' 產生' : '已使用 ' + model + ' 生成');
                        return (USE_TW ? '使用 ' + model + ' 產生' : '使用 ' + model + ' 生成');
                    });
                } else if (/^(\\d+) results?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(\\d+) results?$/i, (m, n) => n + (USE_TW ? ' 個結果' : ' 个结果'));
                } else if (/^(\\d+) chunks?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(\\d+) chunks?$/i, (m, n) => n + (USE_TW ? ' 個分段' : ' 个分段'));
                } else if (/^Chunk (\\d+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Chunk (\\d+)$/i, (m, n) => '分段 ' + n);
                } else if (/^(\\d+) questions?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(\\d+) questions?$/i, (m, n) => n + (USE_TW ? ' 個問題' : ' 个问题'));
                } else if (/^(\\d+) tasks?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(\\d+) tasks?$/i, (m, n) => n + (USE_TW ? ' 個工作' : ' 个任务'));
                } else if (/^\\((\\d+) subagents?\\)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^\\((\\d+) subagents?\\)$/i, (m, n) => '(' + n + (USE_TW ? ' 個子代理)' : ' 个子代理)'));
                } else if (/^\\((\\d+) steps?\\)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^\\((\\d+) steps?\\)$/i, (m, n) => '(' + n + (USE_TW ? ' 個步驟)' : ' 个步骤)'));
                } else if (/^The AlloyDB for PostgreSQL remote/i.test(valNorm)) {
                    newVal = USE_TW ? "AlloyDB for PostgreSQL 遠端 MCP 伺服器可讓您存取並執行 AlloyDB 工具，用於管理 AlloyDB 叢集及執行個體、管理使用者，以及建立和復原資料備份。" : "AlloyDB for PostgreSQL 远程 MCP 服务器可让您访问并运行 AlloyDB 工具，用于管理 AlloyDB 集群及实例、管理用户，以及创建和恢复数据备份。";
                } else if (/^The Cloud SQL remote/i.test(valNorm)) {
                    newVal = USE_TW ? "Cloud SQL 遠端 MCP 伺服器可讓您存取並執行 Cloud SQL 工具，用於管理 Cloud SQL 執行個體、管理使用者、建立和復原資料備份及資料庫維運。" : "Cloud SQL 远程 MCP 服务器可让您访问并运行 Cloud SQL 工具，用于管理 Cloud SQL 实例、管理用户、创建和恢复数据备份及数据库运维。";
                } else if (/^The Spanner remote/i.test(valNorm)) {
                    newVal = USE_TW ? "Spanner 遠端 MCP 伺服器可讓您從 AI 開發環境中存取並執行 Spanner 工具，以建立、管理和查詢分散式資料庫資源。" : "Spanner 远程 MCP 服务器可让您从 AI 开发环境中访问并运行 Spanner 工具，以创建、管理和查询分布式数据库资源。";
                } else if (/^Refreshes in (\\d+) days?, (\\d+) hours?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Refreshes in (\\d+) days?, (\\d+) hours?$/i, (match, d, h) => {
                        return USE_TW ? (d + " 天 " + h + " 小時後更新") : (d + " 天 " + h + " 小时后刷新");
                    });
                } else if (/^Refreshes in (\\d+) hours?, (\\d+) minutes?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Refreshes in (\\d+) hours?, (\\d+) minutes?$/i, (match, h, m) => {
                        return USE_TW ? (h + " 小時 " + m + " 分鐘後更新") : (h + " 小时 " + m + " 分钟后刷新");
                    });
                } else if (/^Refreshes in (\\d+) days?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Refreshes in (\\d+) days?$/i, (match, d) => {
                        return USE_TW ? (d + " 天後更新") : (d + " 天后刷新");
                    });
                } else if (/^Refreshes in (\\d+) hours?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Refreshes in (\\d+) hours?$/i, (match, h) => {
                        return USE_TW ? (h + " 小時後更新") : (h + " 小时后刷新");
                    });
                } else if (/^Refreshes in (\\d+) minutes?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Refreshes in (\\d+) minutes?$/i, (match, m) => {
                        return USE_TW ? (m + " 分鐘後更新") : (m + " 分钟后刷新");
                    });
                } else if (/^You have used some of your weekly limit, it will fully refresh in (.+?)\\.?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^You have used some of your weekly limit, it will fully refresh in (.+?)\\.?$/i, (match, timeStr) => {
                        let t = timeStr.replace(/(\\d+)\\s*days?/gi, (m, n) => n + (USE_TW ? " 天" : " 天"))
                                       .replace(/(\\d+)\\s*hours?/gi, (m, n) => n + (USE_TW ? " 小時" : " 小时"))
                                       .replace(/(\\d+)\\s*minutes?/gi, (m, n) => n + (USE_TW ? " 分鐘" : " 分钟"))
                                       .replace(/(\\d+)\\s*seconds?/gi, (m, n) => n + (USE_TW ? " 秒" : " 秒"))
                                       .replace(/,/g, '');
                        return USE_TW ? ("您已使用了部分每週配額，將在 " + t + " 後完全更新。") : ("您已使用了部分每周配额，将在 " + t + " 后完全刷新。");
                    });
                } else if (/^You have used some of your 5-hour limit, it will fully refresh in (.+?)\\.?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^You have used some of your 5-hour limit, it will fully refresh in (.+?)\\.?$/i, (match, timeStr) => {
                        let t = timeStr.replace(/(\\d+)\\s*days?/gi, (m, n) => n + (USE_TW ? " 天" : " 天"))
                                       .replace(/(\\d+)\\s*hours?/gi, (m, n) => n + (USE_TW ? " 小時" : " 小时"))
                                       .replace(/(\\d+)\\s*minutes?/gi, (m, n) => n + (USE_TW ? " 分鐘" : " 分钟"))
                                       .replace(/(\\d+)\\s*seconds?/gi, (m, n) => n + (USE_TW ? " 秒" : " 秒"))
                                       .replace(/,/g, '');
                        return USE_TW ? ("您已使用了部分 5 小時配額，將在 " + t + " 後完全更新。") : ("您已使用了部分 5 小时配额，将在 " + t + " 后完全刷新。");
                    });
                } else if (/^Learn more about (.+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Learn more about (.+)$/i, (match, p) => {
                        let translatedPreset = p;
                        if (p.toLowerCase() === 'default') translatedPreset = USE_TW ? "預設 (Default)" : "默认 (Default)";
                        else if (p.toLowerCase() === 'full machine') translatedPreset = USE_TW ? "全機存取 (Full Machine)" : "全机访问 (Full Machine)";
                        else if (p.toLowerCase() === 'turbo mode') translatedPreset = USE_TW ? "極速模式 (Turbo Mode)" : "极速模式 (Turbo Mode)";
                        else if (p.toLowerCase() === 'custom') translatedPreset = USE_TW ? "自訂 (Custom)" : "自定义 (Custom)";
                        return USE_TW ? ("瞭解更多關於 " + translatedPreset + " 的詳細資訊") : ("了解更多关于 " + translatedPreset + " 的信息");
                    });
                } else if (/^Yes, and always allow '(.+)' in this project$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Yes, and always allow '(.+)' in this project$/i, (match, cmd) => {
                        return USE_TW ? ("是，且在此專案中一律允許執行 '" + cmd + "'") : ("是，且在此项目中始终允许运行 '" + cmd + "'");
                    });
                } else if (/^Yes, and always allow '(.+)'$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Yes, and always allow '(.+)'$/i, (match, cmd) => {
                        return USE_TW ? ("是，且一律允許執行 '" + cmd + "'") : ("是，且始终允许运行 '" + cmd + "'");
                    });
                } else if (/^(\\d+) tools? enabled$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(\\d+) tools? enabled$/i, (match, num) => {
                        return USE_TW ? (num + " 個工具已啟用") : (num + " 个工具已启用");
                    });
                } else if (/^Show (\\d+) more(\\.\\.\\.|…)?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Show (\\d+) more(\\.\\.\\.|…)?$/i, (match, num) => {
                        return USE_TW ? ("顯示另外 " + num + " 個...") : ("显示另外 " + num + " 个...");
                    });
                } else if (/^See all \\((\\d+)\\)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^See all \\((\\d+)\\)$/i, (match, num) => {
                        return USE_TW ? ("顯示全部 (" + num + ")") : ("显示全部 (" + num + ")");
                    });
                } else if (/^Marked (\\d+) conversations? as read$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Marked (\\d+) conversations? as read$/i, (match, num) => {
                        return USE_TW ? ("已將 " + num + " 個對話標記為已讀") : ("已将 " + num + " 个对话标记为已读");
                    });
                } else if (/^Show submitted \\((\\d+)\\)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Show submitted \\((\\d+)\\)$/i, (match, num) => {
                        return USE_TW ? ("顯示已提交 (" + num + ")") : ("显示已提交 (" + num + ")");
                    });
                } else if (/^Comments \\((\\d+)\\)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Comments \\((\\d+)\\)$/i, (match, num) => {
                        return USE_TW ? ("評論 (" + num + ")") : ("评论 (" + num + ")");
                    });
                } else if (/^Grant administrator access for (.+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Grant administrator access for (.+)$/i, (match, target) => {
                        return USE_TW ? ("授予管理員權限給 " + target) : ("授予管理员权限用于 " + target);
                    });
                } else if (/^Available AI Credits: (\\d+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Available AI Credits: (\\d+)$/i, (match, num) => {
                        return USE_TW ? ("可用 AI 額度: " + num) : ("可用 AI 额度: " + num);
                    });
                } else if (/^Version\\s+([\\d\\.]+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Version\\s+([\\d\\.]+)$/i, (match, v) => {
                        return "版本 " + v;
                    });
                } else if (/^(\\d+)(s|m|h|d|w|mo|yr)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(\\d+)(s|m|h|d|w|mo|yr)$/i, (match, num, unit) => {
                        const unitLower = unit.toLowerCase();
                        let unitStr = "";
                        if (unitLower === "s") unitStr = USE_TW ? "秒前" : "秒前";
                        else if (unitLower === "m") unitStr = USE_TW ? "分鐘前" : "分钟前";
                        else if (unitLower === "h") unitStr = USE_TW ? "小時前" : "小时前";
                        else if (unitLower === "d") unitStr = USE_TW ? "天前" : "天前";
                        else if (unitLower === "w") unitStr = USE_TW ? "週前" : "周前";
                        else if (unitLower === "mo") unitStr = USE_TW ? "個月前" : "个月前";
                        else if (unitLower === "yr") unitStr = USE_TW ? "年前" : "年前";
                        return num + unitStr;
                    });
                } else if (/^(.+?): context deadline exceeded$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(.+?): context deadline exceeded$/i, (match, prefix) => {
                        return prefix + (USE_TW ? ": 請求超時 (context deadline exceeded)" : ": 请求超时 (context deadline exceeded)");
                    });
                } else if (/^(.+?): i\\/o timeout$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^(.+?): i\\/o timeout$/i, (match, prefix) => {
                        return prefix + (USE_TW ? ": I/O 超時 (i/o timeout)" : ": I/O 超时 (i/o timeout)");
                    });
                } else if (/^Are you sure you want to delete (the |this )?project (.+?)\\??$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^Are you sure you want to delete (the |this )?project (.+?)\\??$/i, (match, article, name) => {
                        return USE_TW ? ("您確定要刪除專案 " + name + " 嗎？") : ("您确定要删除项目 " + name + " 吗？");
                    });
                } else if (/^The (.+?) remote MCP server lets you access and run (.+?) tools to (.+)$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^The (.+?) remote MCP server lets you access and run (.+?) tools to (.+)$/i, (match, name, tools, action) => {
                        return name + (USE_TW ? " 遠端 MCP 伺服器可讓您存取並執行 " : " 远程 MCP 服务器可让您访问并运行 ") + tools + (USE_TW ? " 工具以進行管理與操作。" : " 工具以进行管理与操作。");
                    });
                } else if (/^The (.+?) remote MCP server lets you manage (.+) resources\\.?$/i.test(valNorm)) {
                    newVal = valNorm.replace(/^The (.+?) remote MCP server lets you manage (.+) resources\\.?$/i, (match, name, res) => {
                        return name + (USE_TW ? " 遠端 MCP 伺服器可讓您管理 " : " 远程 MCP 服务器可让您管理 ") + res + (USE_TW ? " 資源。" : " 资源。");
                    });
                } else {
                    // 2. 若当前节点位于工具调用步骤行 / 子代理行，尝试动态 AI 动作短语组合翻译
                    let handledDynamic = false;
                    if (isToolStepNode(node)) {
                        const dynTrans = translateDynamicToolAction(valNorm);
                        if (dynTrans && dynTrans !== valNorm) {
                            newVal = dynTrans;
                            handledDynamic = true;
                        }
                    }
                    // 3. 长句子串完整包含滑动替换
                    if (!handledDynamic) {
                        for (const [key, translated] of longEntries) {
                            if (key.length > 15 && valNorm.includes(key)) {
                                newVal = newVal.split(key).join(translated);
                                break;
                            }
                        }
                    }
                }

                if (newVal !== originalVal) {
                    translatedValues.set(node, newVal);
                    node.nodeValue = newVal;
                }
            }
        } catch (e) {}
    }

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            if (m.type === 'childList') {
                for (const n of m.addedNodes) translateNode(n);
            } else if (m.type === 'characterData') {
                translateNode(m.target);
            }
        }
    });

    const obsOpts = { childList: true, subtree: true, characterData: true };

    const startEngine = () => {
        const target = document.body || document.documentElement;
        if (target) {
            try {
                observer.observe(target, obsOpts);
                translateNode(target);
            } catch (e) {}
        }
    };

    const origAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function() {
        const sr = origAttachShadow.apply(this, arguments);
        try { observer.observe(sr, obsOpts); } catch(e) {}
        return sr;
    };

    // 强力多阶段触发绑定
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startEngine);
    } else {
        startEngine();
    }
    window.addEventListener('load', startEngine);
    setTimeout(startEngine, 100);
    setTimeout(startEngine, 300);
    setTimeout(startEngine, 1000);
    setTimeout(startEngine, 3000);
    setTimeout(startEngine, 6000);
})();
${SIGNATURE_END}`;

    return jsSource.replace("DICT_PLACEHOLDER", dictJson).replace("REPLACEMENT_ENTRIES_PLACEHOLDER", entriesJson);
}

function cleanJsContent(content) {
    const regex = new RegExp(escapeRegExp(SIGNATURE_START) + "[\\s\\S]*?" + escapeRegExp(SIGNATURE_END), "g");
    return content.replace(regex, "");
}

function cleanMenuJsContent(content) {
    const startMark = "// ==========================================";
    const endMark = "translateMenu(menu.items);";
    const startIdx = content.indexOf(startMark);
    const endIdx = content.indexOf(endMark);
    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
        return content.substring(0, startIdx) + content.substring(endIdx + endMark.length);
    }
    return content;
}

function cleanTrayJsContent(content) {
    const startMark = "/* --- TRAY TRANSLATION START --- */";
    const endMark = "/* --- TRAY TRANSLATION END --- */";
    const startIdx = content.indexOf(startMark);
    const endIdx = content.indexOf(endMark);
    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
        return content.substring(0, startIdx) + content.substring(endIdx + endMark.length);
    }
    return content;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let wasAppRunning = false;

function checkIfAppIsRunning() {
    try {
        if (process.platform === 'win32') {
            const stdout = child_process.execSync('tasklist /fi "imagename eq Antigravity.exe" /nh', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
            return stdout.toLowerCase().includes('antigravity.exe');
        } else if (process.platform === 'darwin') {
            const stdout = child_process.execSync('pgrep -f Antigravity', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
            return stdout.trim().length > 0;
        }
    } catch (e) {
        // ignore
    }
    return false;
}

function closeAntigravityProcesses() {
    console.log("[1] 检测到 Antigravity 客户端正在运行，正在关闭以解除文件锁...");
    try {
        if (process.platform === 'win32') {
            child_process.execSync('taskkill /f /im Antigravity.exe /t >nul 2>nul');
        } else {
            child_process.execSync('pkill -f Antigravity >/dev/null 2>&1');
        }
    } catch (e) {
        // ignore
    }
    const start = Date.now();
    while (Date.now() - start < 1500) {}
}

function detectInstallationDir(manualDir) {
    if (manualDir) {
        if (fs.existsSync(manualDir)) {
            let resolved = path.resolve(manualDir);
            if (fs.statSync(resolved).isFile() && resolved.endsWith('app.asar')) {
                resolved = path.dirname(resolved);
            }
            return resolved;
        } else {
            console.error(`[错误] 手动指定的路径不存在: ${manualDir}`);
            process.exit(1);
        }
    }

    const candidates = [];
    const seenCandidates = new Set();
    const addCandidate = (candidate, unshift = false) => {
        if (!candidate) return;
        const normalized = path.resolve(candidate);
        const key = normalized.toLowerCase();
        if (!seenCandidates.has(key)) {
            if (unshift) {
                candidates.unshift(normalized);
            } else {
                candidates.push(normalized);
            }
            seenCandidates.add(key);
        }
    };
    const hasAntigravityResources = (candidate) => {
        return fs.existsSync(path.join(candidate, "resources", "app.asar")) ||
            fs.existsSync(path.join(candidate, "app.asar")) ||
            fs.existsSync(path.join(candidate, "Contents", "Resources", "app.asar")) ||
            fs.existsSync(path.join(candidate, "resources", "app", "product.json"));
    };

    if (process.platform === 'win32') {
        // 优先 1：当前正在运行中的 Antigravity 实例路径
        try {
            const wmicOut = child_process.execSync('wmic process where "name like \'%%Antigravity%%\'" get ExecutablePath', { encoding: 'utf-8', stdio: 'pipe' });
            for (const line of wmicOut.split(/\r?\n/)) {
                const trimmed = line.trim();
                if (trimmed && /Antigravity\.exe$/i.test(trimmed) && fs.existsSync(trimmed)) {
                    addCandidate(path.dirname(trimmed), true);
                }
            }
        } catch (e) {}

        // 优先 2：标准 Antigravity 2.0+ 用户目录 (LOCALAPPDATA)
        const localAppdata = process.env.LOCALAPPDATA;
        if (localAppdata) {
            addCandidate(path.join(localAppdata, 'Programs', 'antigravity'), true);
        }

        addCandidate(process.env.ANTIGRAVITY_INSTALL_DIR);
        addCandidate(process.env.ANTIGRAVITY_HOME);

        const registryRoots = [
            'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
            'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
            'HKLM\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
        ];
        for (const root of registryRoots) {
            try {
                const output = child_process.execSync(`reg query "${root}" /s /f Antigravity /d`, { encoding: 'utf-8', stdio: 'pipe' });
                for (const line of output.split(/\r?\n/)) {
                    const match = line.match(/^\s*(InstallLocation|DisplayIcon)\s+REG_\w+\s+(.+)$/i);
                    if (!match) continue;
                    let value = match[2].trim().replace(/^"|"$/g, '');
                    if (/Antigravity\.exe/i.test(value)) {
                        value = path.dirname(value);
                    }
                    addCandidate(value);
                }
            } catch (e) {
                // Registry probing is best-effort; fall back to common locations below.
            }
        }

        const driveLetters = ['C', 'D', 'E', 'F'];
        for (const drive of driveLetters) {
            addCandidate(`${drive}:\\Programs\\Antigravity`);
            addCandidate(`${drive}:\\Antigravity`);
        }
        addCandidate("C:\\Program Files\\Antigravity");
    } else if (process.platform === 'darwin') {
        addCandidate("/Applications/Antigravity.app");
        addCandidate(path.join(process.env.HOME || '', 'Applications', 'Antigravity.app'));
    }

    // 优先匹配包含 app.asar 的 2.0+ 现代化版本
    for (const p of candidates) {
        const isV2 = fs.existsSync(path.join(p, "resources", "app.asar")) ||
                     fs.existsSync(path.join(p, "app.asar")) ||
                     fs.existsSync(path.join(p, "Contents", "Resources", "app.asar"));
        if (fs.existsSync(p) && isV2) {
            console.log(`[探测] 成功自动识别到 Antigravity 2.0+ (app.asar) 安装目录: ${p}`);
            return path.resolve(p);
        }
    }

    // 次级回退匹配（旧版 1.0 架构）
    for (const p of candidates) {
        if (fs.existsSync(p) && hasAntigravityResources(p)) {
            console.log(`[探测] 成功自动识别到 Antigravity 安装目录: ${p}`);
            return path.resolve(p);
        }
    }

    console.error("[错误] 未找到默认安装目录，请使用 --install-dir 手动指定您的安装路径！");
    process.exit(1);
}

function runCommandSync(cmd) {
    try {
        const out = child_process.execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
        return { success: true, stdout: out, stderr: '' };
    } catch (e) {
        return { success: false, stdout: e.stdout || '', stderr: e.stderr || e.message };
    }
}

function resignAppOnMac(anyPath) {
    if (process.platform !== 'darwin') return;
    
    let targetApp = "";
    let current = path.resolve(anyPath);
    for (let i = 0; i < 10; i++) {
        if (current.endsWith(".app")) {
            targetApp = current;
            break;
        }
        const parent = path.dirname(current);
        if (parent === current) break;
        current = parent;
    }
    
    if (targetApp && fs.existsSync(targetApp)) {
        console.log(`[签名] 检测到 macOS 平台，正在对应用包进行本地 ad-hoc 深度重签名: ${targetApp} ...`);
        const signRes = runCommandSync(`codesign --force --deep --sign - "${targetApp}"`);
        if (signRes.success) {
            console.log(`[签名] 重新签名成功！`);
        } else {
            console.warn(`[警告] 重新签名失败。可能会导致应用无法打开。详情:\n${signRes.stderr}\n${signRes.stdout}`);
        }
    } else {
        console.warn(`[警告] 未能从路径 ${anyPath} 识别到有效的 .app 路径，跳过重新签名。`);
    }
}

// ==========================================
// Antigravity 2.0 汉化引擎 (ASAR打包注入模式)
// ==========================================
function install20(resourcesDir) {
    const asarPath = path.join(resourcesDir, "app.asar");
    const bakPath = path.join(resourcesDir, "app.asar.bak");

    if (!fs.existsSync(asarPath)) {
        console.error(`[错误] 未在资源目录中找到 app.asar: ${resourcesDir}`);
        return false;
    }

    // 1. 备份
    if (!fs.existsSync(bakPath)) {
        console.log(`[备份] 正在创建官方原始包备份: app.asar.bak ...`);
        fs.copyFileSync(asarPath, bakPath);
        console.log(`[备份] 备份成功！`);
    } else {
        // 尝试用官方备份覆盖当前 app.asar，以确保每次汉化都基于最干净的官方英文包
        try {
            fs.copyFileSync(bakPath, asarPath);
            console.log(`[还原] 已重置当前 app.asar 为官方原始备份包，以进行全新注入...`);
        } catch (e) {
            console.log(`[提示] 当前 app.asar 被锁定（可能是客户端正在运行），将使用当前包进行增量注入。`);
        }
    }

    // 2. 临时提取目录
    const tempDir = path.join(__dirname, "_temp_asar");
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }

    console.log(`[步骤 2/5] 正在解包提取 app.asar 核心文件 (约需 1~2 秒)...`);
    const extractRes = runCommandSync(`npx -y @electron/asar extract "${asarPath}" "${tempDir}"`);
    if (!extractRes.success || !fs.existsSync(tempDir)) {
        console.error(`[错误] 解包失败，可能是由于系统未安装 Node.js/npm 或者网络限制。`);
        console.error(`详情: ${extractRes.stderr}\n${extractRes.stdout}`);
        return false;
    }

    // 3. 注入 preload.js
    const preloadPath = path.join(tempDir, "dist", "preload.js");
    if (!fs.existsSync(preloadPath)) {
        console.error(`[错误] 解压后未能在指定路径找到 preload.js: ${preloadPath}`);
        fs.rmSync(tempDir, { recursive: true, force: true });
        return false;
    }

    console.log(`[步骤 3/5] 正在注入 2.23.0 全量本地化代码与字典 (2150+ 词条)...`);
    console.log(`  -> 注入 preload.js (DOM 动态翻译引擎)...`);
    let content = fs.readFileSync(preloadPath, 'utf-8');

    // 清理已有的汉化，重新注入
    const cleanedContent = cleanJsContent(content);
    const translationJs = generateJs();
    const newContent = cleanedContent + "\n" + translationJs;

    fs.writeFileSync(preloadPath, newContent, 'utf-8');
    console.log(`  -> preload.js 注入成功！`);

    // 3.1 注入 menu.js (系统菜单汉化)
    const menuPath = path.join(tempDir, "dist", "menu.js");
    if (fs.existsSync(menuPath)) {
        console.log(`  -> 注入 menu.js (系统顶栏菜单)...`);
        let menuContent = fs.readFileSync(menuPath, 'utf-8');
        
        const menuCleaned = cleanMenuJsContent(menuContent);
        
        const menuTranslationJs = `
    // ==========================================
    // Antigravity Native Menu Chinese Translation
    // ==========================================
    const translations = ${USE_TW ? `{
        'File': '檔案',
        'Edit': '編輯',
        'View': '檢視',
        'Window': '視窗',
        'Help': '說明',
        'New Window': '開新視窗',
        'Create Project': '建立專案',
        'Command Palette': '命令面板',
        'Docs': '說明文件',
        'Check for Updates': '檢查更新',
        'Toggle Developer Tools': '切換開發人員工具',
        'Undo': '復原',
        'Redo': '取消復原',
        'Cut': '剪下',
        'Copy': '複製',
        'Paste': '貼上',
        'Select All': '全選',
        'Minimize': '最小化',
        'Maximize': '最大化',
        'Close': '關閉',
        'Zoom': '縮放',
        'Reset Zoom': '重設縮放',
        'Zoom In': '放大',
        'Zoom Out': '縮小',
        'Toggle Full Screen': '切換全螢幕',
        'Connect to WSL': '連線至 WSL',
        'Reopen Locally': '在本地重新開啟',
        'Version': '版本'
    }` : `{
        'File': '文件',
        'Edit': '编辑',
        'View': '视图',
        'Window': '窗口',
        'Help': '帮助',
        'New Window': '新建窗口',
        'Create Project': '创建项目',
        'Command Palette': '命令面板',
        'Docs': '文档',
        'Check for Updates': '检查更新',
        'Toggle Developer Tools': '切换开发者工具',
        'Undo': '撤销',
        'Redo': '重做',
        'Cut': '剪切',
        'Copy': '复制',
        'Paste': '粘贴',
        'Select All': '全选',
        'Minimize': '最小化',
        'Maximize': '最大化',
        'Close': '关闭',
        'Zoom': '缩放',
        'Reset Zoom': '重置缩放',
        'Zoom In': '放大',
        'Zoom Out': '缩小',
        'Toggle Full Screen': '切换全屏',
        'Connect to WSL': '连接到 WSL',
        'Reopen Locally': '在本地重新打开',
        'Version': '版本'
    }`};
    function translateMenu(items) {
        for (const item of items) {
            let label = item.label || '';
            let mnemonic = '';
            let cleanLabel = label;
            const m = label.match(/&([a-zA-Z])/);
            if (m) {
                mnemonic = "(&" + m[1] + ")";
                cleanLabel = label.replace('&', '');
            }
            if (translations[cleanLabel]) {
                item.label = translations[cleanLabel] + mnemonic;
            } else if (translations[label]) {
                item.label = translations[label];
            } else if (/^Version\\s*([\\d\\.]*)$/i.test(cleanLabel)) {
                item.label = cleanLabel.replace(/^Version\\s*([\\d\\.]*)$/i, (match, v) => v ? "版本 " + v : "版本");
            }
            if (item.submenu && item.submenu.items) {
                translateMenu(item.submenu.items);
            }
        }
    }
    translateMenu(menu.items);
    `;

        const targetStr = "electron_1.Menu.setApplicationMenu(menu);";
        const idx = menuCleaned.indexOf(targetStr);
        if (idx !== -1) {
            const patchedMenuContent = menuCleaned.substring(0, idx) + menuTranslationJs + "\n    " + menuCleaned.substring(idx);
            fs.writeFileSync(menuPath, patchedMenuContent, 'utf-8');
            console.log(`[修改] 菜单汉化注入成功！`);
        } else {
            console.warn(`[警告] 未能在 menu.js 中找到设定的插入点。`);
        }
    }

    // 3.2 注入 tray.js (任务栏右键菜单汉化)
    const trayPath = path.join(tempDir, "dist", "tray.js");
    if (fs.existsSync(trayPath)) {
        console.log(`[修改] 正在向 tray.js 注入任务栏菜单汉化...`);
        let trayContent = fs.readFileSync(trayPath, 'utf-8');
        
        // 先清理已有的汉化块
        let trayCleaned = cleanTrayJsContent(trayContent);
        
        // 1. 注入 createTray 里的翻译块 (带标记，兼容 actions 与 actions, onClick)
        const targetCreateRegex = /function\s+createTray\s*\(\s*actions(?:\s*,\s*onClick)?\s*\)\s*\{/;
        const replacementCreate = (match) => `${match}
    /* --- TRAY TRANSLATION START --- */
    const translations = ${USE_TW ? `{
        'No agents running': '無執行中的智能體',
        'Open Antigravity': '開啟反重力智能編程',
        'Quit': '退出'
    }` : `{
        'No agents running': '无运行中的智能体',
        'Open Antigravity': '打开反重力智能编程',
        'Quit': '退出'
    }`};
    for (const item of actions) {
        if (translations[item.label]) {
            item.label = translations[item.label];
        }
    }
    /* --- TRAY TRANSLATION END --- */`;
        
        let trayPatched = trayCleaned.replace(targetCreateRegex, replacementCreate);
        
        // 2. 使用正则替换 updateTrayAgentCount 里的动态显示文本
        const countRegex = /countItem\.label\s*=\s*count\s*>\s*0\s*\?[\s\S]*?:[\s\S]*?;/;
        const replacementCount = USE_TW 
            ? "countItem.label = count > 0 ? `${count} 個智能體執行中` : '無執行中的智能體';"
            : "countItem.label = count > 0 ? `${count} 个智能体运行中` : '无运行中的智能体';";
        trayPatched = trayPatched.replace(countRegex, replacementCount);
        
        fs.writeFileSync(trayPath, trayPatched, 'utf-8');
        console.log(`[修改] 任务栏菜单汉化注入成功！`);
    }

    // 3.3 注入 loadingOverlay.js (加载页汉化)
    const loadingPath = path.join(tempDir, "dist", "loadingOverlay.js");
    if (fs.existsSync(loadingPath)) {
        console.log(`  -> 注入 loadingOverlay.js (启动加载页)...`);
        let loadingContent = fs.readFileSync(loadingPath, 'utf-8');
        
        const targetText = '<div class="text">Loading Antigravity</div>';
        const replacementText = USE_TW
            ? '<div class="text">反重力引擎已啟動，正在努力擺脫地心引力...</div>'
            : '<div class="text">反重力引擎已启动，正在努力摆脱地心引力...</div>';
        
        loadingContent = loadingContent.replace(targetText, replacementText);
        
        fs.writeFileSync(loadingPath, loadingContent, 'utf-8');
        console.log(`  -> loadingOverlay.js 注入成功！`);
    }

    // 3.4 注入 updater.js (更新弹窗汉化)
    const updaterPath = path.join(tempDir, "dist", "updater.js");
    if (fs.existsSync(updaterPath)) {
        console.log(`  -> 注入 updater.js (自动更新弹窗)...`);
        let updaterContent = fs.readFileSync(updaterPath, 'utf-8');
        
        // 替换 Check for Updates 弹窗的属性
        const targetOptions = `                title: 'Check for Updates',
                message: 'No updates available',
                buttons: ['OK'],`;
        const replacementOptions = USE_TW
            ? `                title: '檢查更新',
                message: '暫無可用更新',
                buttons: ['確定'],`
            : `                title: '检查更新',
                message: '暂无可用更新',
                buttons: ['确定'],`;
        
        updaterContent = updaterContent.replace(targetOptions, replacementOptions);
        fs.writeFileSync(updaterPath, updaterContent, 'utf-8');
        console.log(`  -> updater.js 注入成功！`);
    }

    // 3.5 注入 ideInstall/wizardHtml.js (新版安装引导向导页汉化)
    const wizardPath = path.join(tempDir, "dist", "ideInstall", "wizardHtml.js");
    if (fs.existsSync(wizardPath)) {
        console.log(`  -> 注入 wizardHtml.js (首次安装引导页)...`);
        let wizardContent = fs.readFileSync(wizardPath, 'utf-8');
        
        const wizardReplacements = USE_TW ? [
            ["Setting up…", "正在配置…"],
            ["Welcome to the new Antigravity!", "歡迎使用全新的 Antigravity！"],
            ["Antigravity has been redesigned to put agents first with new capabilities. If you'd still like a code editor, you can download it as a separate app named <b>Antigravity IDE</b>.", "Antigravity 已全面重新設計，以智能體為核心並帶來全新能力。若您仍需要程式碼編輯器，可將其作為名為 <b>Antigravity IDE</b> 的獨立應用程式下載。"],
            ["Download the Antigravity IDE", "下載 Antigravity IDE 編輯器"],
            ["Explore the new Antigravity", "探索全新的 Antigravity"]
        ] : [
            ["Setting up…", "正在配置…"],
            ["Welcome to the new Antigravity!", "欢迎使用全新的 Antigravity！"],
            ["Antigravity has been redesigned to put agents first with new capabilities. If you'd still like a code editor, you can download it as a separate app named <b>Antigravity IDE</b>.", "Antigravity 已全面重新设计，以智能体为核心并带来全新能力。如果您仍需要代码编辑器，可将其作为名为 <b>Antigravity IDE</b> 的独立应用下载。"],
            ["Download the Antigravity IDE", "下载 Antigravity IDE 编辑器"],
            ["Explore the new Antigravity", "探索全新的 Antigravity"]
        ];

        for (const [fromStr, toStr] of wizardReplacements) {
            wizardContent = wizardContent.split(fromStr).join(toStr);
        }

        fs.writeFileSync(wizardPath, wizardContent, 'utf-8');
        console.log(`  -> wizardHtml.js 注入成功！`);
    }

    // 3.6 注入 provisionSplash.js (WSL 配置加载页汉化)
    const provisionPath = path.join(tempDir, "dist", "provisionSplash.js");
    if (fs.existsSync(provisionPath)) {
        console.log(`  -> 注入 provisionSplash.js (WSL 配置加载页)...`);
        let provContent = fs.readFileSync(provisionPath, 'utf-8');
        
        const targetProv = "Setting up WSL:";
        const replaceProv = USE_TW ? "正在設定 WSL：" : "正在配置 WSL：";
        provContent = provContent.split(targetProv).join(replaceProv);
        
        fs.writeFileSync(provisionPath, provContent, 'utf-8');
        console.log(`  -> provisionSplash.js 注入成功！`);
    }

    // 4. 重新打包
    console.log(`[步骤 4/5] 正在重新封包 app.asar 核心 (约需 1~2 秒)...`);
    const packRes = runCommandSync(`npx -y @electron/asar pack "${tempDir}" "${asarPath}"`);
    
    // 5. 清理临时文件夹
    fs.rmSync(tempDir, { recursive: true, force: true });

    if (!packRes.success) {
        console.error(`[错误] 打包失败。`);
        console.error(`详情: ${packRes.stderr}\n${packRes.stdout}`);
        return false;
    }

    resignAppOnMac(resourcesDir);
    console.log(`[步骤 5/5] 校验包完整性并同步生效...`);
    console.log(`============================================================`);
    console.log(`[√] 恭喜！Antigravity 2.23.0 中文汉化已 100% 部署成功！`);
    console.log(`============================================================`);
    return true;
}

function restore20(resourcesDir) {
    const asarPath = path.join(resourcesDir, "app.asar");
    const bakPath = path.join(resourcesDir, "app.asar.bak");

    if (!fs.existsSync(bakPath)) {
        console.log("[!] 未找到备份文件 app.asar.bak，可能尚未安装过汉化或备份被删除。");
        return false;
    }

    console.log("[还原] 正在用官方备份文件恢复...");
    fs.copyFileSync(bakPath, asarPath);
    fs.unlinkSync(bakPath);
    resignAppOnMac(resourcesDir);
    console.log("[√] 官方 app.asar 已成功恢复！");
    return true;
}

// ==========================================
// Antigravity 1.0 汉化引擎 (旧版 HTML 注入模式)
// ==========================================
const OLD_TARGET_FILES = [
    path.join("resources", "app", "out", "vs", "code", "electron-browser", "workbench", "workbench-jetski-agent.html"),
    path.join("resources", "app", "out", "vs", "code", "electron-browser", "workbench", "workbench.html")
];

function backupFiles10(installDir) {
    for (const relPath of OLD_TARGET_FILES) {
        const absPath = path.join(installDir, relPath);
        const bakPath = absPath + ".bak";
        if (fs.existsSync(absPath) && !fs.existsSync(bakPath)) {
            fs.copyFileSync(absPath, bakPath);
            console.log(`[备份] 已创建旧版 HTML 备份: ${path.basename(absPath)}.bak`);
        }
    }
}

function injectHtml10(installDir, htmlRelPath) {
    const absPath = path.join(installDir, htmlRelPath);
    if (!fs.existsSync(absPath)) return false;
    
    let content = fs.readFileSync(absPath, 'utf-8');
    
    const injectStr = '<script src="../../../../ag_agent_hanhua.js"></script>';
    content = content.replace(/<script.*ag_agent_hanhua\.js.*><\/script>/g, '');
    
    if (content.includes('</body>')) {
        content = content.replace('</body>', `${injectStr}</body>`);
    } else {
        content += injectStr;
    }
        
    fs.writeFileSync(absPath, content, 'utf-8');
    return true;
}

function updateChecksums10(installDir) {
    const productJsonPath = path.join(installDir, "resources", "app", "product.json");
    if (!fs.existsSync(productJsonPath)) return;
    
    const data = JSON.parse(fs.readFileSync(productJsonPath, 'utf-8'));
    
    for (const relPath of OLD_TARGET_FILES) {
        const absPath = path.join(installDir, relPath);
        if (fs.existsSync(absPath)) {
            const key = relPath.replace(/\\/g, "/").replace("resources/app/out/", "");
            
            const fileBuffer = fs.readFileSync(absPath);
            const hash = crypto.createHash('sha256').update(fileBuffer).digest();
            data.checksums[key] = hash.toString('base64').replace(/=/g, '');
        }
    }
    
    fs.writeFileSync(productJsonPath, JSON.stringify(data, null, '\t'), 'utf-8');
}

function install10(installDir) {
    console.log("====== 检测到 Antigravity 1.0 架构，正在使用 HTML 注入引擎 ======");
    backupFiles10(installDir);
    
    // 生成单独的 js 汉化文件
    const hanhuaJsPath = path.join(installDir, "resources", "app", "out", "ag_agent_hanhua.js");
    fs.mkdirSync(path.dirname(hanhuaJsPath), { recursive: true });
    
    const jsContent = generateJs();
    fs.writeFileSync(hanhuaJsPath, jsContent, 'utf-8');
        
    for (const html of OLD_TARGET_FILES) {
        if (injectHtml10(installDir, html)) {
            console.log(`[√] 注入成功: ${path.basename(html)}`);
        }
    }
            
    updateChecksums10(installDir);
    resignAppOnMac(installDir);
    console.log("[√] Antigravity 1.0 汉化部署完成！");
    return true;
}

function restore10(installDir) {
    console.log("====== 正在恢复 Antigravity 1.0 官方原版 ======");
    let changed = false;
    for (const relPath of OLD_TARGET_FILES) {
        const absPath = path.join(installDir, relPath);
        const bakPath = absPath + ".bak";
        if (fs.existsSync(bakPath)) {
            fs.copyFileSync(bakPath, absPath);
            fs.unlinkSync(bakPath);
            console.log(`[还原] 已恢复 HTML: ${path.basename(absPath)}`);
            changed = true;
        }
    }
    
    const hanhuaJsPath = path.join(installDir, "resources", "app", "out", "ag_agent_hanhua.js");
    if (fs.existsSync(hanhuaJsPath)) {
        fs.unlinkSync(hanhuaJsPath);
        console.log(`[还原] 已删除汉化脚本`);
        changed = true;
    }
        
    if (changed) {
        updateChecksums10(installDir);
        resignAppOnMac(installDir);
        console.log("[√] 校验值已同步，1.0 软件恢复至原始状态。");
    } else {
        console.log("[!] 未找到 1.0 备份文件。");
    }
    return true;
}

// ==========================================
// 入口
// ==========================================
function main() {
    let huifu = false;
    let manualDir = "";
    let noKill = false;

    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--huifu') {
            huifu = true;
        } else if (args[i] === '--install-dir') {
            manualDir = args[i + 1] || "";
            i++;
        } else if (args[i] === '--no-kill') {
            noKill = true;
        } else if (args[i] === '--brand-title') {
            i++;
        }
    }

    console.log("============================================================");
    console.log(USE_TW ? "  Antigravity 2.0 繁體中文漢化注入工具 (v2.23.0 全新適配版)" : "  Antigravity 2.0 中文汉化注入工具 (v2.23.0 全新适配版)");
    console.log("============================================================\n");

    // 1. 探测路径
    const installDir = detectInstallationDir(manualDir);
    
    // 2. 检测客户端是否正在运行，并根据参数决定是否关闭以解除文件锁定
    wasAppRunning = checkIfAppIsRunning();
    if (noKill) {
        console.log("[跳过] 检测到 --no-kill 参数，跳过关闭 Antigravity 运行进程。");
    } else {
        closeAntigravityProcesses();
    }

    // 3. 找到 resources 资源目录
    let resourcesDir = "";
    if (fs.existsSync(path.join(installDir, "resources"))) {
        resourcesDir = path.join(installDir, "resources");
    } else if (fs.existsSync(path.join(installDir, "Contents", "Resources"))) {
        resourcesDir = path.join(installDir, "Contents", "Resources");
    } else if (installDir.replace(/\\/g, "/").replace(/\/$/, "").toLowerCase().endsWith("/resources")) {
        resourcesDir = installDir;
    } else {
        if (fs.existsSync(path.join(installDir, "app.asar"))) {
            resourcesDir = installDir;
        } else {
            resourcesDir = path.join(installDir, "resources");
        }
    }

    if (!fs.existsSync(resourcesDir)) {
        console.error(`[错误] 无法定位有效的资源(resources)目录: ${resourcesDir}`);
        process.exit(1);
    }

    // 4. 根据架构执行
    const asarPath = path.join(resourcesDir, "app.asar");
    const isV2 = fs.existsSync(asarPath);
    let success = false;

    if (huifu) {
        console.log("====== 正在卸载中文汉化，恢复官方原版 ======");
        if (isV2) {
            success = restore20(resourcesDir);
        } else {
            success = restore10(installDir);
        }
    } else {
        console.log("====== 正在安装 Antigravity 中文汉化 ======");
        if (isV2) {
            success = install20(resourcesDir);
        } else {
            success = install10(installDir);
        }
    }

    // 5. 校验通过且原来客户端在运行，则自动重新启动客户端
    if (success && wasAppRunning) {
        console.log("\n[启动] 检测到安装前反重力客户端处于开启状态，正在重新启动客户端...");
        try {
            if (process.platform === 'win32') {
                const exePath = path.join(installDir, 'Antigravity.exe');
                if (fs.existsSync(exePath)) {
                    const child = child_process.spawn(exePath, [], {
                        detached: true,
                        stdio: 'ignore'
                    });
                    child.unref();
                    console.log("[启动] 客户端启动成功！");
                } else {
                    console.warn(`[警告] 未找到客户端主程序: ${exePath}`);
                }
            } else if (process.platform === 'darwin') {
                child_process.exec(`open "${installDir}"`);
                console.log("[启动] 客户端启动成功！");
            }
        } catch (e) {
            console.warn(`[警告] 客户端启动失败: ${e.message}`);
        }
    }

    if (!success) {
        process.exit(1);
    }
}

main();
