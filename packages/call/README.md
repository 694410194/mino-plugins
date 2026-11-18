# mino-call

Sessionless 主动陪伴 agent：常驻的"逗号"——把各来源的事件归并成**事项**
（matter），按紧急度判断哪些需要你，把该推的推给你，其余安静躺在
Notebook 里。灵感来自 AFK-surf/Comma。

## 它做什么

- **归并**：source 上报的事件按确定性 `groupKey` 合并到开放事项，不重复打扰
- **判断**：定时注意力扫描（默认 15 分钟）——配了 `decideModel` 走模型裁决，
  未配走启发式（紧急词/问句探测）
- **推送**：`critical/high/ask` 三档才会递给你；每日推送有预算
  （默认 12 条）和最小间隔（默认 30 分钟）
- **留痕**：全部事项渲染成 `<workspace>/Call/Notebook.md`，模型永不改写，
  纯投影
- **简报**：每天 `briefing.hour`（默认 9 点）推一条当日概览

## 形态

bundle 自带三行：插件本体 + `mino-call-router` 专用 preset（triage/委派
prompt 的 Router Session）+ `mino-call-worker` preset（任务执行载体，每轮
回复必须以 `[CALL-STATUS] done|needs_review|failed:` 状态块收尾）。装即
挂载，卸即干净。Router 会话在列表里显示为 **Mino 陪伴**（标题以用户改名
语义永久固定）；worker 会话以 `call-task-*` 命名。

## 对话面：事项 + 任务 + Loops + 配对

Router Session 上挂了 11 个 agent 作用域工具（`agent.ctx.tools.register`，
随 agent 销毁自动回滚，插件卸载时按账清理）——事项生命周期、任务委派、
值守循环和配对全部可以对话完成，不需要 UI 面板也不需要改 YAML：

- `call_matters`：按状态列事项（counts + 标题 + 最新条目摘要）
- `call_matter_done`：把事项标为已处理（接受 id 或唯一标题子串）
- `call_matter_snooze`：推迟事项（`minutes` 或 ISO `until`），到点由
  注意力扫描自动唤醒并重新判级
- `call_im_pair`：查看/选择 call 接管的 IM bot；配对写 `state` 表
  持久化，未接管的源在下一次重试（~15s）生效
- `call_task_add`：把「该干的活」委派成 Task——起 `call-task-*` worker
  会话（`mino-call-worker` preset）执行，状态机
  `open→working→needs_review→done/failed/cancelled` 持久化在 `tasks` 表
- `call_tasks` / `call_task_cancel`：看任务板、撤任务
- `call_task_answer`：worker 卡在 needs_review（拿不准问你）时，答复经
  `agent.followup` 注回 worker 会话续跑——这就是「拍板→续干」回路
- `call_loop_add` / `call_loop_remove` / `call_loops`：模型自写值守
  循环；配 `checkTool`+`checkArgs` 时每轮先跑确定性工具比对 checkpoint，
  输出没变则本轮静默（安静时零模型调用）

Worker 监控三通道：`session/event` 全局监听解析 assistant 消息状态块；
`agent/status` idle 兜底——worker 停了没收尾就经 `sessionPersistence`
读持久层尾部重判，仍无状态块按契约违例转 needs_review；`worker.timeoutMinutes`
超时巡检同转 needs_review。冷恢复：`open` 任务重派；`working` 任务经官方
`schedule` 投递「继续」唤醒物化冷会话；会话真丢转 needs_review 拍给人。
worker 调敏感工具天然走官方 pre-execute 审批缝，无答者 fail-closed。
`worker.kind=cli` 时改经 `ctx.subprocess.spawn`（显式 argv/cwd/stdio/
graceMs）起外部命令行 agent——autoloop 式，stdin 喂任务目标、stdout 收
状态块（此形态不支持 answer 续跑）。

配对受阻时（@xmanrui/dsh-im 未装、没有可用 bot、多候选歧义）不再只写日志：
按状态指纹**去重后**往 Router Session 注入一条提示消息，由陪伴人格
向用户解释并引导用 `call_im_pair` 完成选择；成功配对后指纹复位，
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
  运行时修改在重 seed 后保留；模型也可经 `call_loop_add` 自写（可带
  `checkTool` 确定性前置闸）
- `worker.kind`：`dsh-session`（默认，preset worker 会话）或 `cli`
  （`ctx.subprocess` 外部命令行 agent，配 `worker.command` 空格分隔 argv）
- `worker.timeoutMinutes`：worker 单轮超时（默认 30），超时转 needs_review
- `notebook.path` / `briefing` / `workspaceRoot` 均有默认值

## 前置条件

- 存储域 `call`（自动建库，无需动作）
- IM 源与推送通道依赖 **@xmanrui/dsh-im**（`dshIm` 服务契约）；不装 @xmanrui/dsh-im 也能跑，
  只是没有入站源和外推

## 开发

`pnpm typecheck`/`build` 需要 `@deepseek-ai/*` 解析到**邻仓 mino-agent 源码**
（vendored cordis），不是 npm 发布版：把 `node_modules/@deepseek-ai/<pkg>`
junction 到 `../mino-agent` 对应包目录即可（同 `scripts/map-superagent-deps.cjs`
的约定）。当前需 7 个：cordis、dsh-api-session-controller、dsh-llm、
dsh-session、dsh-storage-domain、dsh-workspace、dsh-agent。
`zod` 须与工作区 dsh 包同版（当前 4.6.6），低了 typecheck 报
`validate/validateAsync` 结构缺失。

`fixture-tasks.ts` 是任务/worker 层的确定性夹具（stub 官方缝跑全生命周期
11 组断言）：`node fixture-tasks.ts`。

## 已知边界

- `decideModel` 走裸 `llm.stream`，不经过 preset 工具面；误判只影响推送时机，
  不影响事项持久化
- cli worker 一次性执行，无 needs_review 续跑（进程已退出）；需要拍板回路
  的任务用 `dsh-session`
