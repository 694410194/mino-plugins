# mino-agent-team

纯配置 bundle：把官方 experimental **Agent Teams** 三件套挂进 profile，零自有代码。

挂载内容（`cordis.patch.yml` 三条 insert）：

| 行 | 官方包 | 提供 |
|---|---|---|
| `agent-team` | `@deepseek-ai/dsh-experimental-agent-team` | Lead/teammate 名册、bot 间 inbox 私信（Steer 投递 + 冷恢复唤醒）、共享任务 DAG、`agentTeam` 会话投影 |
| `tool-agent-team` | `@deepseek-ai/dsh-experimental-tool-agent-team` | 模型工具：`spawn_teammate` / `send_message` / `task_*` / `wait_for_change` |
| `ui-agent-team` | `@deepseek-ai/dsh-experimental-client-ui-agent-team` | Web 名册 + 任务路线图面板 |

## 用法

让 Lead 建 teammate：「创建一个名叫 reviewer 的队友，负责检查 diff」——teammate
有名字、职位描述和独立会话；任意成员可互发消息，冷成员收到消息自动冷恢复；
任务板支持依赖（blockedBy）、认领（owner）与 CAS 防覆盖。

## 注意

- experimental 包，无上游稳定性承诺；升级走 `engines.dsh` 版本闸门。
- 前置：持久会话存储（`dsh-base` 已挂 `dsh-session-persistence-jsonl`）。
- teammate 共享同一工作目录；跨进程协作不支持（上游限制）。
