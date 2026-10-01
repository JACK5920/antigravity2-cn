import json
import os

TOOL_CALL_ENTRIES = {
    "Tool Calls": ("工具调用", "工具調用"),
    "Tool Call": ("工具调用", "工具調用"),
    "Tool Output": ("工具输出", "工具輸出"),
    "Tool Call Ready": ("工具调用就绪", "工具調用就緒"),
    "Tool Call Generation": ("生成工具调用", "產生工具調用"),
    "Tool Call ID:": ("工具调用 ID:", "工具調用 ID:"),
    "Tool Call Gen": ("工具调用生成", "工具調用產生"),
    "Accept Step": ("接受步骤", "接受步驟"),
    "Collapse Diffs": ("折叠所有差异", "收合所有差異"),
    "Expand Diffs": ("展开所有差异", "展開所有差異"),
    "Open Diff": ("打开差异比对", "開啟差異比對"),
    "View Diff": ("查看差异比对", "檢視差異比對"),
    "View Split Diff": ("查看分栏差异比对", "檢視左右分割差異"),
    "View Stacked Diff": ("查看堆叠差异比对", "檢視上下堆疊差異"),
    "Copy Command": ("复制命令", "複製命令"),
    "File Diff Comments": ("文件差异评论", "檔案差異留言"),
    "Generation Steps": ("生成步骤", "產生步驟"),
    "Generic Tool": ("通用工具", "通用工具"),
    "Terminal commands the agent can execute.": ("智能体可执行的终端命令。", "智能體可執行的終端機命令。"),
    "Allow List Terminal Commands": ("白名单终端命令", "白名單終端機命令"),
    "Deny List Terminal Commands": ("黑名单终端命令", "黑名單終端機命令"),
    "Enable Browser Tools": ("启用浏览器工具", "啟用瀏覽器工具"),
    "Excluded Step": ("已排除步骤", "已排除步驟"),
    "Excluded & Hidden Step": ("已排除且隐藏的步骤", "已排除且隱藏的步驟"),
    "Hidden Active Step": ("隐藏的活动步骤", "隱藏的使用中步驟"),
    "Running command...": ("正在运行命令...", "正在執行命令..."),
    "Executing tool...": ("正在执行工具...", "正在執行工具..."),
    "Command executed successfully": ("命令执行成功", "命令執行成功"),
    "Execution failed with exit code": ("执行失败，退出代码：", "執行失敗，結束代碼："),
    "Click to view output": ("点击查看输出", "按一下檢視輸出"),
    "Execution in progress...": ("执行中...", "執行中..."),
    "Accept change": ("接受更改", "接受變更"),
    "Reject change": ("拒绝更改", "拒絕變更"),
    "Apply changes": ("应用更改", "套用變更"),
    "Discard changes": ("放弃更改", "捨棄變更"),
    "Advanced Command Access": ("高级命令访问权限", "進階命令存取權限"),
    "Group Actions": ("分组操作", "群組動作"),
    "Inline Actions": ("行内操作", "行內動作"),
    "More Actions": ("更多操作", "更多動作"),
    "CortexStep": ("Cortex 步骤", "Cortex 步驟"),
    "CascadeStepItem": ("级联步骤项", "串聯步驟項目"),
}

def main():
    dicts_cn = 'E:/antigravity2-cn-main/dicts/common.json'
    dicts_tw = 'E:/antigravity2-cn-main/dicts_tw/common.json'

    with open(dicts_cn, 'r', encoding='utf-8') as f:
        cn_data = json.load(f)
    with open(dicts_tw, 'r', encoding='utf-8') as f:
        tw_data = json.load(f)

    added = 0
    for k, (cn, tw) in TOOL_CALL_ENTRIES.items():
        if k not in cn_data:
            cn_data[k] = cn
            tw_data[k] = tw
            added += 1

    with open(dicts_cn, 'w', encoding='utf-8') as f:
        json.dump(cn_data, f, ensure_ascii=False, indent=4)
    with open(dicts_tw, 'w', encoding='utf-8') as f:
        json.dump(tw_data, f, ensure_ascii=False, indent=4)

    print(f"成功将 {added} 条工具调用相关词条增补写入 common.json！")
    print(f"当前 common.json 累计词条数: {len(cn_data)}")

if __name__ == '__main__':
    main()
