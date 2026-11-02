# packages/ — Mino 插件包清单

全部包走官方 `dsh.bundle` + `cordis.patch.yml` 组合，零内核改动。
目录名 = 裸仓名（`mino.baby/git/<目录名>`），包名统一 `mino-*` 前缀。
分类与评分元数据见 `eval/catalog-annotations.json`（索引 enrich 源）；
单包来源/推荐位/首次配置见 `INTEGRATION.md`。
新增包：`packages/<名>/` + `pnpm-workspace.yaml` 排除行 + 标注源一条。

## 人格 persona

| 目录 | 包 | 说明 |
|---|---|---|
| persona | mino-persona | Mino 人设卡 + 长期记忆（fork dsh-soul-md） |
| mood | mino-mood | 心情系统 + 右下角挂饰 |
| speak-up | mino-speak-up | 主动搭话（本地掷骰子触发） |

## 智能体 agent

| 目录 | 包 | 说明 |
|---|---|---|
| superagent | mino-superagent | 主动陪伴 agent（fork dsh-superagent 原型） |
| knowledge-studio | mino-knowledge-studio | 工作区资料→报告/PPT/表格/导图/音视频 |
| task-board | mino-task-board | 侧边栏多列任务看板（卡片=真实会话） |
| pilot | mino-pilot | Windows 桌面自动化（高危面） |
| skillhub | mino-skillhub | SkillHub 技能浏览/安装/管理（运行时注册表通道） |

## 记忆 memory

| 目录 | 包 | 说明 |
|---|---|---|
| fish-memory | mino-fish-memory | 会淡忘的带时间戳长期记忆 |

## 渠道 channel

| 目录 | 包 | 说明 |
|---|---|---|
| im | mino-im | 微信/QQ/飞书/钉钉/企微/TG/Discord/Slack/WhatsApp 9 渠道 |
| aurabot | mino-aurabot | QQ 鱼本体（聊天/表情/语音/空间/B站，模块化） |
| qqbot | mino-qqbot | 腾讯官方 fork，QQ 私聊群聊直聊 |
| qq-link | mino-qq-link | QQ 双向桥（OneBot 11） |
| qq-console | mino-qq-console | 手机 QQ 遥控器（会话绑定/任务确认/打断） |
| bridge | mino-bridge | 远程通道：扫码直连/隧道/多 IM |

## 媒体 media

| 目录 | 包 | 说明 |
|---|---|---|
| image | mino-image | 对话内生图/修图（走 mino.baby 账户额度） |
| voice | mino-voice | TTS/STT 语音 |
| meme | mino-meme | 表情包斗图 + 图库市场 |
| drawio | mino-drawio | draw.io 图表 + 侧边栏 |
| open-sea | mino-open-sea | 海洋主题皮肤 |
| visualize | mino-visualize | 对话内交互 HTML 卡片 |

## 角色扮演 roleplay

| 目录 | 包 | 说明 |
|---|---|---|
| tavern | mino-tavern | SillyTavern 卡 + 世界书 + MVU（~58 工具重场景） |
| oh-story | mino-oh-story | 小说/短剧/游戏改编/视频解说四工作台 |

## B 站 bilibili

| 目录 | 包 | 说明 |
|---|---|---|
| bili-scroll | mino-bili-scroll | 每日刷 B 站挑片写日报 |
| bili-humanism | mino-bili-humanism | 人类世界内容养人格 |
| bili-live | mino-bili-live | 直播弹幕/AI 陪聊/语音转写 |
| bili-whale | mino-bili-whale | 养鱼日记（27 项设置页） |

## 桌面 desktop

| 目录 | 包 | 说明 |
|---|---|---|
| pet | mino-pet | Mino 桌宠（fork dsh-dafeiyu） |
| whale-musume | mino-whale-musume | 鲸鱼娘桌宠（45 成就+小游戏） |
| skin-market | mino-skin-market | 皮肤发现/一键安装/生命周期 |

## 工具 utility

| 目录 | 包 | 说明 |
|---|---|---|
| status | mino-status | 状态栏梗 + 鲸尾动作 |
| balance | mino-balance | 余额小鲸鱼挂件 |
| damage-pulse | mino-damage-pulse | token 用量/成本/余额动画 |
| ops | mino-ops | Windows 高性能文件/PTC 工具（省 token） |
| rewind | mino-rewind | 会话内原地回退 + 文件还原 |
| chat-import | mino-chat-import | 导入 13 家 coding agent 会话历史 |
| browser | mino-browser | 浏览器扩展配套桥 |
| notes | mino-notes | 对话导出 PNG 便签/云便签 |
| safety-net | mino-safety-net | 执行前守卫（拦 rm -rf/.env/SSH key 读取） |
| skill-explorer | mino-skill-explorer | 技能中心 GUI：浏览/启停/新建/回收站 |

## MCP 接入 mcp（纯配置 bundle，插官方 dsh-mcp-client 行）

| 目录 | 包 | 说明 |
|---|---|---|
| mcp-memory | mino-mcp-memory | 官方 memory 知识图谱（stdio/npx） |
| mcp-thinking | mino-mcp-thinking | sequential-thinking 逐步思考（stdio/npx） |
| mcp-chrome-devtools | mino-mcp-chrome-devtools | Chrome DevTools（高危面已标注） |
| mcp-github | mino-mcp-github | GitHub 远端（streamable-http，需 GITHUB_TOKEN） |
| mcp-brave-search | mino-mcp-brave-search | Brave 搜索（需 BRAVE_API_KEY） |

## 技能包 skills（ctx.skills provider，SKILL.md 随包分发）

| 目录 | 包 | 说明 |
|---|---|---|
| skill-commit | mino-skill-commit | commit-message 中文写作约定 |
| skill-mino-release | mino-skill-mino-release | Mino 部署发布速查 |
| skill-drama | mino-skill-drama | 短剧/漫剧全流程 11 技能（fork drama-skills） |
| skill-duanju | mino-skill-duanju | 微短剧剧本全流程（fork short-drama） |
| skill-screenwriting | mino-skill-screenwriting | 26 个编剧技能（fork screenwriting-skills） |
| skill-script-review | mino-skill-script-review | 红果 Top100 审稿方法论（fork screenwriter-skill） |

## 不分发 private（`private: true`，generator/verify 跳过）

| 目录 | 包 | 说明 |
|---|---|---|
| comma | mino-comma | WIP 主动陪伴 agent（搭手脚手架） |
| market | mino-market | 退役：官方 plugin-market 上线后退出精选 |
