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
prompt 的 Router Session）。装即挂载，卸即干净。会话在列表里显示为
**Mino 陪伴**（标题以用户改名语义永久固定）。

## 对话面：事项管理 + 配对

Router Session 上挂了 4 个 agent 作用域工具（`agent.ctx.tools.register`，
随 agent 销毁自动回滚，插件卸载时按账清理）——事项生命周期和配对全部
可以对话完成，不需要 UI 面板也不需要改 YAML：

- `comma_matters`：按状态列事项（counts + 标题 + 最新条目摘要）
- `comma_matter_done`：把事项标为已处理（接受 id 或唯一标题子串）
- `comma_matter_snooze`：推迟事项（`minutes` 或 ISO `until`），到点由
  注意力扫描自动唤醒并重新判级
- `comma_im_pair`：查看/选择 comma 接管的 IM bot；配对写 `state` 表
  持久化，未接管的源在下一次重试（~15s）生效

配对受阻时（mino-im 未装、没有可用 bot、多候选歧义）不再只写日志：
按状态指纹**去重后**往 Router Session 注入一条提示消息，由陪伴人格
向用户解释并引导用 `comma_im_pair` 完成选择；成功配对后指纹复位，
再次受阻会重新提示。

## 配置

全部走 Settings 表单（`Config` schema）。IM 相关项留空时会**自动配对**：

- `sources.im.botId`：留空 → `config → 持久选择 → dshIm.listBots()` 显式
  解析；恰好一个可接管 bot 就自动用它并把选择写进 `state` 表（重启沿用），
  多个候选则保持关闭并经 Router 会话引导选择。持久选择里的 bot 若已从
  发现列表消失会被清除并重新解析。
  `sources.im.enabled: false` 显式关闭该源
- `notify.botId` + `notify.targetId`：推送出口。留空 → 同源 bot 上
  `listTargets()` 恰好一个目标就自动用它，同样落 `state`；无目标/多目标
  则不推（事项照常在 Notebook 里）
- `proactive.decideModel`：判断模型 `{provider, model}`，不设则启发式兜底
- `loops[]`：周期唤醒 router 的循环项（`name/everyMinutes/prompt/enabled`），
  运行时修改在重 seed 后保留
- `notebook.path` / `briefing` / `workspaceRoot` 均有默认值

## 前置条件

- 存储域 `comma`（自动建库，无需动作）
- IM 源与推送通道依赖 **mino-im**（`dshIm` 服务契约）；不装 mino-im 也能跑，
  只是没有入站源和外推

## 开发

`pnpm typecheck`/`build` 需要 `@deepseek-ai/*` 解析到**邻仓 mino-agent 源码**
（vendored cordis），不是 npm 发布版：把 `node_modules/@deepseek-ai/<pkg>`
junction 到 `../mino-agent` 对应包目录即可（同 `scripts/map-superagent-deps.cjs`
的约定）。当前需 6 个：cordis、dsh-api-session-controller、dsh-llm、
dsh-session、dsh-storage-domain、dsh-workspace。

## 已知边界

- worker 委派未落地：router 只做 triage 与提醒，不分派子任务（preset 注释
  已声明）
- `decideModel` 走裸 `llm.stream`，不经过 preset 工具面；误判只影响推送时机，
  不影响事项持久化
