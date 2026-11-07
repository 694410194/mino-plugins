# packages/ — Mino 插件包清单

全部包走官方 `dsh.bundle` + `cordis.patch.yml` 组合，零内核改动。
目录名 = 裸仓名（`mino.baby/git/<目录名>`），包名统一 `mino-*` 前缀。
分类与评分元数据见 `eval/catalog-annotations.json`（索引 enrich 源）；
单包来源/推荐位/首次配置见 `INTEGRATION.md`。
新增包：`packages/<名>/` + `pnpm-workspace.yaml` 排除行 + 标注源一条。

## 人格 persona

| 目录 | 包 | 说明 |
|---|---|---|
| persona | dsh-soul-md | Mino 人设卡 + 长期记忆（fork dsh-soul-md） |
| mood | dsh-feiyu-mood | 心情系统 + 右下角挂饰 |
| speak-up | dsh-speak-up | 主动搭话（本地掷骰子触发） |

## 智能体 agent

| 目录 | 包 | 说明 |
|---|---|---|
| superagent | dsh-superagent | 主动陪伴 agent（fork dsh-superagent 原型） |
| comma | mino-comma | Sessionless 主动陪伴：事项归并/紧急度判断/推送预算/Notebook |
| knowledge-studio | dsh-knowledge-studio | 工作区资料→报告/PPT/表格/导图/音视频 |
| task-board | @linxin666/dsh-client-ui-task-board | 侧边栏多列任务看板（卡片=真实会话） |
| pilot | @momasiku/dsh-pilot | Windows 桌面自动化（高危面） |

## 记忆 memory

| 目录 | 包 | 说明 |
|---|---|---|
| fish-memory | dsh-fish-memory | 会淡忘的带时间戳长期记忆 |

## 渠道 channel

| 目录 | 包 | 说明 |
|---|---|---|
| im | @xmanrui/dsh-im | 微信/QQ/飞书/钉钉/企微/TG/Discord/Slack/WhatsApp 9 渠道 |
| aurabot | dsh-aurabot-qq | QQ 鱼本体（聊天/表情/语音/空间/B站，模块化） |
| qqbot | @tencent-connect/dsh-qqbot | 腾讯官方 fork，QQ 私聊群聊直聊 |
| qq-link | dsh-qq-link | QQ 双向桥（OneBot 11） |
| qq-console | dsh-qq-console-v2 | 手机 QQ 遥控器（会话绑定/任务确认/打断） |
| bridge | @wenbin_wb/dsh-bridge | 远程通道：扫码直连/隧道/多 IM |

## 媒体 media

| 目录 | 包 | 说明 |
|---|---|---|
| image | dsh-image-gen | 对话内生图/修图（走 mino.baby 账户额度） |
| voice | dsh-voice | TTS/STT 语音 |
| meme | dsh-meme | 表情包斗图 + 图库市场 |
| drawio | dsh-drawio | draw.io 图表 + 侧边栏 |
| oh-story | oh-story-dsh | 小说/短剧/游戏改编/视频解说四工作台 |
| visualize | dsh-visualize | 对话内交互 HTML 卡片 |

## 角色扮演 roleplay

| 目录 | 包 | 说明 |
|---|---|---|
| tavern | dsh-sillytavern | SillyTavern 卡 + 世界书 + MVU（~58 工具重场景） |

## B 站 bilibili

| 目录 | 包 | 说明 |
|---|---|---|
| bili-scroll | dsh-bili-scroll | 每日刷 B 站挑片写日报 |
| bili-humanism | dsh-bili-humanism | 人类世界内容养人格 |
| bili-live | dsh-bili-danmaku-lite | 直播弹幕/AI 陪聊/语音转写 |
| bili-whale | dsh-bili-whale | 养鱼日记（27 项设置页） |

## 桌面 desktop

| 目录 | 包 | 说明 |
|---|---|---|
| pet | dsh-dafeiyu | Mino 桌宠（fork dsh-dafeiyu） |
| whale-musume | dsh-whale-musume | 鲸鱼娘桌宠（45 成就+小游戏） |
| skin-market | dsh-skin-market | 皮肤发现/一键安装/生命周期 |
| open-sea | open-sea-skin | 实时海洋主题皮肤 |

## 工具 utility

| 目录 | 包 | 说明 |
|---|---|---|
| status | dsh-status-rotator | 状态栏梗 + 鲸尾动作 |
| balance | dsh-whale-widget | 余额小鲸鱼挂件 |
| damage-pulse | dsh-damage-pulse | token 用量/成本/余额动画 |
| ops | dsh-ops | Windows 高性能文件/PTC 工具（省 token） |
| rewind | dsh-rewind-plugin | 会话内原地回退 + 文件还原 |
| chat-import | dsh-chat-import | 导入 13 家 coding agent 会话历史 |
| browser | @yuxianglin/dsh-bridge-browser | 浏览器扩展配套桥 |
| notes | dsh-notes | 对话导出 PNG 便签/云便签 |
| safety-net | cc-safety-net | 执行前守卫（拦 rm -rf/.env/SSH key 读取） |
| skill-explorer | dsh-skill-explorer | 技能中心 GUI：浏览/启停/新建/回收站 |
| skillhub | @astron-team/skillhub-dsh | SkillHub 技能浏览/安装/管理（运行时注册表通道） |

## MCP 接入 mcp（纯配置 bundle，插官方 dsh-mcp-client 行）

| 目录 | 包 | 说明 |
|---|---|---|
| mcp-memory | @modelcontextprotocol/server-memory | 官方 memory 知识图谱（stdio/npx） |
| mcp-thinking | @modelcontextprotocol/server-sequential-thinking | sequential-thinking 逐步思考（stdio/npx） |
| mcp-chrome-devtools | chrome-devtools-mcp | Chrome DevTools（高危面已标注） |
| mcp-github | github-mcp-server | GitHub 远端（streamable-http，需 GITHUB_TOKEN） |
| mcp-brave-search | @modelcontextprotocol/server-brave-search | Brave 搜索（需 BRAVE_API_KEY） |

## 技能包 skills（ctx.skills provider，SKILL.md 随包分发）

| 目录 | 包 | 说明 |
|---|---|---|
| skill-commit | mino-skill-commit | commit-message 中文写作约定 |
| skill-mino-release | mino-skill-mino-release | Mino 部署发布速查 |
| skill-drama | drama-skills | 短剧/漫剧全流程 11 技能（fork drama-skills） |
| skill-duanju | short-drama | 微短剧剧本全流程（fork short-drama） |
| skill-screenwriting | screenwriting-skills | 26 个编剧技能（fork screenwriting-skills） |
| skill-script-review | screenwriter-skill | 红果 Top100 审稿方法论（fork screenwriter-skill） |

## 不分发 private（`private: true`，generator/verify 跳过）

| 目录 | 包 | 说明 |
|---|---|---|
| market | dshmarket | 退出索引分发；仍预装，社区插件目录入口 |
