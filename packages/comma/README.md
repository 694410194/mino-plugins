# mino-comma

Sessionless 主动陪伴 agent：常驻的"逗号"——把各来源的事件归并成**事项**
（matter），按紧急度判断哪些需要你，把该推的推给你，其余安静躺在
Notebook 里。灵感来自 AFK-surf/Comma。

## 它做什么

- **归并**：source 上报的事件按确定性 `groupKey` 合并到开放事项，不重复打扰
- **判断**：定时注意力扫描（默认 15 分钟）——配了 `decideModel` 走模型裁决，
  未配走启发式（紧急词/问句探测）
- **推送**：`critical/high/ask` 三档才会递给你；每日推送有预算
  （默认 12 条）和最小间隔（默认 30 分钟）
- **留痕**：全部事项渲染成 `<workspace>/Comma/Notebook.md`，模型永不改写，
  纯投影
- **简报**：每天 `briefing.hour`（默认 9 点）推一条当日概览

## 形态

bundle 自带两行：插件本体 + `mino-comma-router` 专用 preset（triage/委派
prompt 的 Router Session，不带工具面）。装即挂载，卸即干净。

## 配置

全部走 Settings 表单（`Config` schema）：

- `sources.im.botId`：挂 mino-im 机器人做入站源（external-consumer 独占模式，
  空 = 该源关闭）。目前唯一内置源；无源时插件照常运行，只跑 loops/简报
- `proactive.decideModel`：判断模型 `{provider, model}`，不设则启发式兜底
- `notify.botId` + `notify.targetId`：主动推送出口（mino-im 投递对象），
  空 = 不推，只看 Notebook
- `loops[]`：周期唤醒 router 的循环项（`name/everyMinutes/prompt/enabled`），
  运行时修改在重 seed 后保留
- `notebook.path` / `briefing` / `workspaceRoot` 均有默认值

## 前置条件

- 存储域 `comma`（自动建库，无需动作）
- IM 源与推送通道依赖 **mino-im**（`dshIm` 服务契约）；不装 mino-im 也能跑，
  只是没有入站源和外推

## 已知边界

- worker 委派未落地：router 只做 triage 与提醒，不分派子任务（preset 注释
  已声明）
- `decideModel` 走裸 `llm.stream`，不经过 preset 工具面；误判只影响推送时机，
  不影响事项持久化
