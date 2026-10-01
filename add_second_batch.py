import json
import os
import re

ADDITIONAL_EXACT_MAP = {
    # 按钮与操作
    "Add to Chat": ("添加到对话", "新增至對話"),
    "Add to Chat/Quote": ("添加至对话/引用", "新增至對話/引用"),
    "Added to the model": ("已添加到模型", "已新增至模型"),
    "Allow": ("允许", "允許"),
    "Allow All": ("允许所有", "允許全部"),
    "Deny": ("拒绝", "拒絕"),
    "Deny All": ("拒绝所有", "拒絕全部"),
    "Chat anyways": ("仍然对话", "仍然對話"),
    "Retry with another model": ("换用其他模型重试", "換用其他模型重試"),
    "Copy to clipboard": ("复制到剪贴板", "複製到剪貼簿"),
    "Copied to clipboard": ("已复制到剪贴板", "已複製到剪貼簿"),
    "Copied error to clipboard": ("已将错误复制到剪贴板", "已將錯誤複製到剪貼簿"),
    "Copied error": ("已复制错误", "已複製錯誤"),
    "Open in Browser": ("在浏览器中打开", "在瀏覽器中開啟"),
    "Open in Terminal": ("在终端中打开", "在終端機中開啟"),
    "View in Explorer": ("在资源管理器中查看", "在檔案總管中檢視"),

    # 设置与状态
    "Allow the agent to run without restrictions.": ("允许智能体不受限制地运行。", "允許智能體不受限制地執行。"),
    "Browser Configuration Required": ("需要配置浏览器", "需要設定瀏覽器"),
    "Cascade Config": ("级联配置", "串聯設定"),
    "Battle Mode Infos": ("对决模式信息", "對決模式資訊"),
    "Command is required": ("命令为必填项", "命令為必填項目"),
    "Command spec is required": ("命令规范为必填项", "命令規格為必填項目"),
    "Commit message cannot be empty": ("提交信息不能为空", "提交訊息不可為空白"),
    "Confirmation required to execute this step": ("执行此步骤需要确认", "執行此步驟需要確認"),
    "Action required": ("需要操作", "需要採取動作"),
    "Action Required": ("需要操作", "需要採取動作"),

    # 智能体状态
    "Agent finished": ("智能体已完成", "智能體已完成"),
    "Agent is working": ("智能体正在工作", "智能體正在工作"),
    "Agent is thinking": ("智能体正在思考", "智能體正在思考"),
    "Agent is analyzing videos": ("智能体正在分析视频", "智能體正在分析影片"),
    "Agent response": ("智能体回复", "智能體回覆"),
    "Agent data is not available": ("智能体数据不可用", "智能體資料無法使用"),
    "Browser Subagent Viewer": ("浏览器子智能体查看器", "瀏覽器子智能體檢視器"),
    "Available workspaces": ("可用工作区", "可用工作區"),
    "Clone current workspace into a new independent workspace": ("将当前工作区克隆为新的独立工作区", "將目前工作區複製為新的獨立工作區"),

    # 模型与配额
    "Model quota exceeded": ("超出模型配额", "超出模型配額"),
    "Token usage breakdown": ("Token 使用明细", "Token 用量明細"),
    "Prompt tokens": ("提示词 Token", "提示詞 Token"),
    "Completion tokens": ("生成 Token", "完成 Token"),
    "Total tokens": ("总 Token", "總 Token"),
    "Input tokens": ("输入 Token", "輸入 Token"),
    "Output tokens": ("输出 Token", "輸出 Token"),
    "Streaming response...": ("正在流式传输回复...", "正在串流傳輸回覆..."),
    "Waiting for response...": ("等待响应中...", "正在等候回應..."),
    "Generating code...": ("正在生成代码...", "正在產生程式碼..."),
    "Applying changes...": ("正在应用更改...", "正在套用變更..."),

    # 界面交互与帮助
    "Click to copy": ("点击复制", "按一下複製"),
    "Click to expand": ("点击展开", "按一下展開"),
    "Click to collapse": ("点击折叠", "按一下收合"),
    "No changes detected": ("未检测到任何更改", "未偵測到任何變更"),
    "File saved successfully": ("文件保存成功", "檔案儲存成功"),
    "Failed to save file": ("保存文件失败", "儲存檔案失敗"),
    "Close Tab": ("关闭标签页", "關閉分頁"),
    "Close Other Tabs": ("关闭其他标签页", "關閉其他分頁"),
    "Close Tabs to the Right": ("关闭右侧标签页", "關閉右側分頁"),
    "Close All Tabs": ("关闭所有标签页", "關閉所有分頁"),
    "Pin Tab": ("固定标签页", "釘選分頁"),
    "Unpin Tab": ("取消固定标签页", "取消釘選分頁"),
}

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
    ("剪贴板", "剪貼簿"),
    ("浏览器", "瀏覽器"),
    ("代码", "程式碼"),
    ("文件", "檔案"),
]

def to_tw(text_cn):
    res = text_cn
    for cn, tw in TW_CONVERSIONS:
        res = res.replace(cn, tw)
    return res

def main():
    dicts_cn_dir = 'E:/antigravity2-cn-main/dicts'
    dicts_tw_dir = 'E:/antigravity2-cn-main/dicts_tw'

    common_cn_p = os.path.join(dicts_cn_dir, 'common.json')
    common_tw_p = os.path.join(dicts_tw_dir, 'common.json')

    with open(common_cn_p, 'r', encoding='utf-8') as f:
        common_cn = json.load(f)
    with open(common_tw_p, 'r', encoding='utf-8') as f:
        common_tw = json.load(f)

    added = 0
    for k, (cn, tw) in ADDITIONAL_EXACT_MAP.items():
        if k not in common_cn:
            common_cn[k] = cn
            common_tw[k] = tw
            added += 1

    with open(common_cn_p, 'w', encoding='utf-8') as f:
        json.dump(common_cn, f, ensure_ascii=False, indent=4)
    with open(common_tw_p, 'w', encoding='utf-8') as f:
        json.dump(common_tw, f, ensure_ascii=False, indent=4)

    print(f"第二批新增精确词条: {added} 条，当前 common.json 总词条数: {len(common_cn)}")

if __name__ == '__main__':
    main()
