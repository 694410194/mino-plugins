# mino-brief

早晚简报：一个专用「简报员」会话每天定时醒来，把值得她留意的事写进「今日」页。

## 形态

```
cordis.patch.yml 插入两行
├── mino-brief            本插件（宿主半：建会话 + 建定时条目）
└── mino-brief-preset     @deepseek-ai/dsh-agent-preset 行（简报员人格）

启动时
├── sessionController.create({ sessionId: 'mino-brief', agentPreset: 'mino-brief' })
└── schedule.create(daily) ×2（早报/晚报，target = 该固定会话）

到点
└── 宿主向简报会话投递 user 消息 → 普通模型轮 → 模型自行调 today_post
```

- **不自造调度**：定时条目用宿主官方 `schedule` 服务，自动出现在宿主
  schedules 面板与 mino-today 的「定时」tab，用户可暂停/删除。
- **不自造生成器**：一次带人格的模型轮就是生成管线；简报员会话固定常驻，
  有自己的历史与记忆。
- **投递走官方缝**：`today_post` 是 mino-today 注册的全局模型工具；
  未装 mino-today 时简报退化为会话内文字（用户可直接打开简报会话看）。

## 用户删除/暂停语义

- 暂停：走宿主调度 UI（edit active=false），插件不干预。
- 删除：条目从 catalog 消失后记 tombstone，**不会**在下次启动偷偷复活；
  想重新开=改配置或清掉 `brief` 存储域的 `gone:*` 行。

## 配置

```yaml
mino-brief:
  timeZone: Asia/Shanghai        # IANA zone
  workspaceRoot: ~/brief         # 简报 Workspace 目录，默认 profile cwd
  morning:
    enabled: true
    time: '08:00'                # HH:mm 或 HH:mm:ss
    prompt: <触发消息文本>
  evening:
    enabled: true
    time: '21:00'
    prompt: <触发消息文本>
```

## 依赖

inject: `storageDomain` `sessionController` `workspaceRegistry`；
可选（`ctx.get`）：`schedule`（缺失则只建会话、不注册定时，warn 记日志）。
软依赖 mino-today 的 `today_post` 全局工具（未装降级，见上）。
