# Mino 整合包集成清单

主仓插件全部以官方 `dsh.bundle` + `cordis.patch.yml` 机制解耦，零内核改动。

## 本仓包（packages/）

| 包 | 来源 | 预装? | 首次配置 |
|---|---|---|---|
| dsh-image-gen | 自研 (Apache-2.0) | 是 | 无（走账户额度） |
| dsh-soul-md | fork dsh-soul-md | 是 | 无（Mino 卡已预置为默认） |
| @xmanrui/dsh-im | fork @xmanrui/dsh-im | 推荐位首选 | 扫码即建机器人；微信/QQ/飞书/钉钉/企微/TG/Discord/Slack/WhatsApp 9 渠道 |
| dsh-voice | fork dsh-voice | 推荐位 | TTS 零配置；STT 需 ASR key（Groq 免费档可用） |
| dsh-dafeiyu | fork dsh-dafeiyu | 推荐位 | Python + PySide6；鲸鱼素材保留可切换，默认 Mino 帧 |
| dsh-superagent | fork 官方 superagent 原型 + im-watch 源 | 实验向推荐位 | SETUP 向导：bot 账号+准入名单+stateDir；源码在本仓用 tsdown 构建 |
| mino-call | 自研 sessionless 主动陪伴（AFK-surf/Comma 启发） | 已实测（plugweb 常驻运行，router 会话+事项域起；vstest 四源全链——webwatch: watch_scan → 2 item/2 matter 按站点归组，二次轮询幂等；mail: 本地夹具 IMAP → mail_recent/mail_search → 2 item（邮件归组）；calendar: 本地夹具 CalDAV → cal_sync+cal_upcoming → 2 item（按日归组），三轮 poll 幂等；tasks: 探针插件以 `ctx.provide('taskBoard')` 同名服务面供件 → `ctx.get('taskBoard').snapshot()` 消费 → 2 item（[任务失败]+[任务到期]，running 滤除）） | 零配置可跑；webwatch 源免凭据（读浏览器本地历史）；im 源需 @xmanrui/dsh-im botId（external-consumer 独占），推送出口需 notify.botId+targetId；mail 源消费 connector-mail 凭据（IMAP），calendar 源消费 connector-calendar（CalDAV sync 可关）；tasks 源走 task-board 公开 `taskBoard` 服务缝（非工具名、非私有存储）——真板消费未实测（真实 Mino.exe 占 ledger 锁，vstest 拿不到；官方 `ctx.provide('taskBoard')` 服务面已逐行核对）；feedback 降权回环已实测（notify.postToFeed 默认开：通知投 mino-today feed 带 `source=call:<sourceKind>`；decideSweep 经 `ctx.get('mino-today').feedbackSummary()` 把 not_interested≥1 或 down>up 的源压成 low/quiet——夹具对照：muted mail URGENT→low/quiet 无 notifiedAt，未 mute calendar→high/notify+feed 卡落账）；router 冷会话同款 list 修复；decideModel prompt 已注入历史事项+muted 源提示（确定性测试：stub llm 捕获 prompt 含两块 preamble，判后 muted 硬门闸仍优先于 judge 结论）；worker 委派已落地并夹具实测——Task 实体独立 tasks 表（open→working→needs_review→done/failed/cancelled），`call_task_add` 经 sessionController 起 call-task-* 会话跑 mino-call-worker preset（[CALL-STATUS] done|needs_review|failed 收尾契约）；监控=session/event 全局监听解析状态块 + agent/status idle 兜底（sessionPersistence 读持久层尾部重判）+ timeoutMinutes 超时巡检；needs_review 经 call_task_answer→agent.followup 注回续跑（拍板→续干回路）；冷恢复=open 重派 + working 经官方 schedule 投递唤醒 + 会话丢失转 needs_review；worker 敏感工具天然走官方 pre-execute 门闸 fail-closed；worker.kind=cli 经 ctx.subprocess.spawn（显式 argv/cwd/stdio/graceMs）起外部命令行 agent（stdin 喂目标 stdout 收块）；Loops 升级 call_loop_add 模型自写 + checkTool/checkArgs 确定性前置闸（tools.execute 跑公开工具比对 checkpoint，未变静默零模型调用）；14 组确定性夹具全绿（fixture-tasks.ts，含竞态回归+wire 契约+dshIm listBots 对象形+loop checkpoint 断言）；zod 升 4.6.6 对齐工作区 dsh 包修存量 typecheck 漂移；vstest 真机全链实测（DeepSeek-V4.1-Flash）：create→worker 实跑→[CALL-STATUS] done 落库（13×19=247）；needs_review 真问题→router 自主调 call_task_answer→agent.followup 注回→worker turn 续跑数十步；中断 working 任务→recoverTasks 经 schedule.create（timing after_seconds，session 目标）投递唤醒→worker 冷启续跑→再 needs_review；session/event 与 agent/status 竞态下终态粘性实测（done/needs_review 不被 idle 兜底回退）；外部注入走真实客户端面 /api session/prompt（connect 换 v2 cookie）——router 会话被单写句柄独占时 session/writer-held，测试环境多 runtime 共享 profile 时属预期；全量缝审计后修两处契约偏差——dshIm.listBots 返回是 {botId,channel} 对象数组（PROACTIVE_DELIVERY 文档）而非字符串，原代码把对象当 botId 比对/传参会导致记忆 bot 被误清+单 bot 自动配对传入对象；loop checkpoint 整包序列化 ToolBatchResult 回显随机 callId 导致永不匹配、确定性闸永远放行，改为只比 results[].result 业务结果（loopCheckpointOf 提纯函数+夹具断言） |
| mino-meeting-detect | 自研会议临近检测→提醒编排（calendar 工具 + 宿主 schedule，不持有日历存储、不自研调度） | 已实测（vstest：cal_upcoming 经 tools.execute → 未来事件建 `at` 一次性提醒 + reminded:* 墓碑去重；临窗事件建 `after` 近即时提醒 → 准点投递 mino-meeting-detect 会话 → 模型轮按人格输出「要不要开录音记笔记」并指引 vnote_start；域名注册发现 schedule 域不许连字符 → meeting_detect；会话存在性同款 list 修复） | 零配置可跑；calendar 插件未装/凭据缺失时空转无害；leadMinutes/pollMinutes/lookaheadDays 可配；真人确认→vnote_start 链路依赖 mino-voice-notes 服务缝（已 provide('mino-voice-notes') 就位）与 ask_user/审批缝 |
| mino-connector-webwatch | 自研浏览器历史关注扫描（watch_scan/watch_suggest 两模型工具） | 已实测（vstest：真实环境 7 浏览器库 0 命中如实回报；种子库 12306/淘宝 2 命中被 call 源消费） | 无；只读本地 Chrome/Edge/Brave/Firefox 历史 DB（快照拷贝，不持续监控）；⚠ 曾修大整数 bug：Chromium last_visit_time≈1.3e16 超 MAX_SAFE，node:sqlite 须 setReadBigInts，否则 catch 静默吞→永远 0 命中 |
| mino-connector-mail | 自研 IMAP/SMTP 邮件连接器（读 mail_recent/mail_search；写 mail_draft/mail_send/mail_unsubscribe 挂官方 pre-execute ask 门闸） | 已实测（本地夹具 IMAP+SMTP：recent/search 2 封；draft→APPEND、send→SMTP RCPT/DATA、unsubscribe→List-Unsubscribe 体级全通；SDK 会话全链——模型调 mail_send → approval/asked「mail connector sensitive action」→ allowed-once → 夹具发件箱收信；ENVELOPE 正则修过——原表达式要三个开括号而真实响应只有两个，recent 曾恒空） | 凭据 DSH_HOME/connector-mail.json（host/port/user/tls + `passRef` 指官方凭据库引用名经 `credentials.resolve` 取密，明文 pass 回退——夹具实测 LOGIN 用上了 cred_set 的库值）；写工具无审批答者时 fail-closed |
| mino-connector-calendar | 自研日历连接器（读 cal_import/cal_upcoming/cal_sync；写 cal_write/cal_delete 挂同款 ask 门闸） | 已实测（本地夹具 CalDAV：cal_write→PUT+本地库 uid 落账→cal_upcoming 读出→同 uid 覆盖更新→cal_delete→DELETE+清库；cal_sync 去重修复——INSERT WHERE NOT EXISTS 四元组+打开清存量；fmt 秒位修复——15:0000→15:00；写链会话级投递因测试实例调度竞争未走完，门闸与 mail_send 同构） | CalDAV 凭据 DSH_HOME/connector-cloud.json caldav 段（`passRef` 走凭据库同 mail，明文 pass 回退）；cal_sync 可选；写工具 fail-closed 同 mail |
| mino-voice-notes | 自研语音笔记（MediaRecorder→分段上传→speechToText 转写→自有存储+分享页） | 已实测（vstest：cookie 鉴权下 start/segment/stop/list/note/update/share/delete/audio 全路由 200/404 齐；正弦波 WAV 全链 start→segment→stop→transcribing→ready；分享前缀路由修复——官方匹配要求 prefix 不带尾斜杠） | 侧栏面板+主页面板经官方 slots；转写走 ctx.speechToText（SenseVoice 首用下载模型，需网络）；vnote_* 六工具达会话面（注册缝与 today 同款已验证形态）；真实人声转写待有麦环境复验 |
| mino-brief | 自研早晚简报（固定简报员会话+宿主 schedule daily 条目） | 已实测（plugweb：preset 会话建成、双 daily 入宿主 catalog、21:00/21:12 两次准点投递、persona+时区齐、装 mino-today 后 today_post/diary_write 到达会话工具面、无内容时按设计静默收尾；会话存在性改走 `sessionController.list`——resolveAgent 只见活会话，冷会话误判后 create 撞 ApiSessionCwdConflict 曾致整插件不激活，修复后 5→4 条告警全为环境项） | 零配置可跑；定时条目用户可暂停/删除（删后 tombstone 不复活）；投递软依赖 mino-today 的 today_post；会话 cwd 与当前 workspace 不符时容错沿用旧会话（投递按 sessionId 走） |
| mino-feiyu-garden | 自研「海蒂花园」养鱼工作台（media-desk 仅审美参考，未集成） | 已实测（plugweb 侧栏行+main 页渲染、状态路由、喂食/摸头/改名动作全过） | 无；状态落 `DSH_HOME \|\| ~/.mino` 下 feiyu-garden/；客户端早抓+乐观态抗 socket 池拥挤 |
| mino-today | 自研「今日」页：feed/日记/定时聚合 + 关注追踪 + schema 卡 + 会话内 today_post 结果卡（tool.call.toolview keyed 槽） | 已实测（vstest：5 工具达 request/header [today_post/diary_write/watch_add/watch_list/watch_remove]；watch_add 模型全链——watch 落账+宿主 daily 条目建（15:00 Asia/Shanghai、agentPreset=mino-brief 目标）；watch_list→watch_remove 连宿主条目一起撤；模型 today_post 带 card:{progress} 全链落账；pin/feedback/watches/read 路由 HTTP 实测 200/400/404 齐；旧 store.json 兼容） | 零配置可跑；watch_remove 的 id 参数容错主题原文（唯一匹配）；schedule.edit miss/conflict 透传 404/409；schema 卡三型 list/metric/progress；toolview 注册经 slots.inject 安静缺席，宿主 dsh-client-ui-tool 在 asar 内（座位实测存在），视觉渲染待真人会话确认；`provide('mino-today')` 服务缝已实测（feedbackSummary 按 source 聚合 up/down/not_interested——call 降权回环的消费端，只读不取值） |
| mino-cred-vault | 自研凭据引导薄层（cred_status/cred_set/cred_unset 走官方 `ctx.get('credentials')` 缝——dsh-credentials-local 在 dsh-base 名册内） | 已实测（SDK 会话全链：request/header 三工具达面；cred_set→approval/asked「cred-vault sensitive action」→allowed-once→官方 .credentials.yaml 真写；cred_status ref→已配置（describe 遮蔽预览）；cred_unset→门闸→删除；库文件无残留） | 零配置可跑；无取值工具（resolve 不露给模型，密钥不进会话）；record 半只读枚举；缝未挂载时如实回报 seam:absent；消费方已落地——mail/calendar `passRef`、notion `NOTION_TOKEN`、qqmeeting `TXMEET_*` 全走该缝 |
| mino-connector-notion | 自研 Notion 连接器（官方 REST API 2022-06-28，Bearer integration token 经凭据库 NOTION_TOKEN） | 已实测（本地假 Notion API：notion_search→POST /v1/search 带 Bearer+版本头→标题/URL 归组；notion_page→GET /v1/pages/:id→摘要；404 错误如实上抛；token 经 `credentials.resolve('NOTION_TOKEN')` 取库值——resolvedRefs 日志实锤） | 凭据 cred_set NOTION_TOKEN=ntn_xxx；配置文件 tokenRef 可改名、baseUrl 可覆盖；token 不落配置文件（明文 token 字段仅回退） |
| mino-connector-qqmeeting | 自研腾讯会议连接器（企业自建应用 AKSK，官方 TC3-HMAC-SHA256 签名——规则按官方文档逐条实现非猜测） | 已实测（本地假会议 API **服务端复算签名**：X-TC-Key/Nonce/Timestamp 字典序进签名串、base64(hex(HMAC-SHA256(SecretKey))) 逐字节比对通过；mtg_list→GET /v1/meetings→2 场会议归组；mtg_get→详情；缺 SecretKey 时 NEED_CFG 报错不发未签名请求） | AppId/SdkId 落配置文件；SecretId/SecretKey 走 cred_set TXMEET_SECRET_ID/TXMEET_SECRET_KEY（明文字段回退）；真实腾讯账号未验（需企业凭证） |
| dsh-sillytavern | fork KamishiroRei/dsh-sillytavern | 推荐位 | 无（预设选“酒馆跑团”）；ST V2/V3/PNG 卡+世界书+MVU |
| dshmarket | fork dshmarket | **是**（内置 bundle 层，仍 private 不进索引——市场不能安装自身） | 社区全量目录 + backup/drain/channels；`plugins.item` 顶层卡片复用其市场页；注意其目录未经精选闸门，与 mino.baby 精选通道（「发现」）互补并存 |
| dsh-aurabot-qq | fork dsh-aurabot-qq | 推荐位 | OneBot/NapCat 个人号；QQ 鱼本体（聊天/表情/语音/记事/空间/B站/唱歌，模块化） |
| dsh-qq-link | fork Yuuyuko-uu/dsh-qq-link（插件许可 1.2） | 推荐位 | OneBot 11/NapCat；QQ 双向桥 |
| dsh-speak-up | fork Yuuyuko-uu/dsh-speak-up（同上许可） | 推荐位 | 无；主动搭话（本地掷骰子触发） |
| dsh-feiyu-mood | fork Yuuyuko-uu/dsh-feiyu-mood（同上） | 推荐位 | 无；心情系统+右下角挂饰 |
| dsh-fish-memory | fork Yuuyuko-uu/dsh-fish-memory（同上） | 推荐位 | 无；会淡忘的带时间戳长期记忆 |
| dsh-whale-widget | fork dsh-whale-widget | 推荐位 | 无；鲸鱼娘余额挂件（余额/峰谷/飘字） |
| dsh-status-rotator | fork dsh-status-rotator | 推荐位 | 无；状态栏梗+鲸尾动作 |
| dsh-bili-scroll | fork dsh-bili-scroll | 推荐位 | B站 cookie；每日刷B站挑片写日报 |
| dsh-bili-humanism | fork dsh-bili-humanism | 推荐位 | B站 cookie；人类世界内容养人格（human-world.md） |
| dsh-meme | fork dsh-meme | 推荐位 | 无；表情包斗图+图库市场 |
| @wenbin_wb/dsh-bridge | fork @wenbin_wb/dsh-bridge | 推荐位 | 远程通道配置；扫码直连/隧道/多IM机器人+安全认证 |
| @yuxianglin/dsh-bridge-browser | fork @yuxianglin/dsh-bridge-browser | 进阶推荐位 | 需装配套 Chrome 扩展；源码 tsc+tsdown 在本仓构建 |
| @momasiku/dsh-pilot | fork @momasiku/dsh-pilot | 进阶推荐位 | Windows 桌面自动化；能力边界大先看说明 |
| open-sea-skin | fork open-sea-skin | 推荐位 | 无；海洋主题皮肤 |
| dsh-whale-musume | fork dsh-whale-musume | 推荐位（与 pet 二选一） | 无；鲸鱼娘桌宠 45 成就+3 小游戏 |
| oh-story-dsh | fork zenstory-ai/oh-story-dsh（npm @oh-story/dsh 官方包改名） | 推荐位 | 无；小说/短剧/游戏改编/视频解说四工作台，知识库已内置（21MB） |
| @astron-team/skillhub-dsh | fork @astron-team/skillhub-dsh（5.3k★） | 推荐位 | 无；SkillHub 技能浏览/安装/管理，skill 包分发轨 |
| dsh-skill-explorer | fork @linxin666/dsh-client-ui-skill-explorer（9.5k★） | 推荐位 | 无；技能中心 GUI：分级浏览/启停/新建/回收站 |
| dsh-knowledge-studio | fork @eduwork/dsh-knowledge-studio | 推荐位 | 首次使用需明示同意；工作区资料→报告/PPT/表格/导图/音视频 |
| dsh-drawio | fork dsh-drawio | 推荐位 | 无；draw.io 图表（分镜结构/流程图） |
| dsh-notes | fork @zhaoolee/dsh-notes | 推荐位 | 需配置方圆小站账号；对话导出 PNG 便签/云便签（产出→发帖链路，注意内容出域） |
| dsh-ops | fork dsh-ops（5.0k★） | 推荐位 | 无；Windows bash/pwsh 高性能工具省 token，八子模块按 preset 挂 |
| dsh-visualize | fork @nagi-ovo/dsh-visualize | 推荐位 | 无；对话内交互 HTML 卡片（交付物可视化，CDN 渲染外部资源） |
| dsh-damage-pulse | fork dsh-damage-pulse | 推荐位 | 无；token 用量/单次成本/余额动画，可选微信通知（配置后用量数据外发） |
| cc-safety-net | fork cc-safety-net（npm 直装件收编，已验收） | 推荐位强推 | 无；执行前守卫拦 reset--hard/rm-rf/.env·SSH key 读取，pilot/文件工具高危面兜底 |
| dsh-chat-import | fork dsh-chat-import | 推荐位 | 无；导入 13 家 coding agent 会话历史（迁移钩；功能本体即读其他 agent 本地数据目录） |
| dsh-rewind-plugin | fork dsh-rewind-plugin | 推荐位 | 无；会话内原地回退（改稿返工场景） |
| dsh-skin-market | fork dsh-skin-market | 推荐位 | 无；社区皮肤发现/一键安装/生命周期管理 |
| @linxin666/dsh-client-ui-task-board | fork @linxin666/dsh-client-ui-task-board（9.9k★） | 推荐位 | 无；侧边栏多列任务看板，卡片=真实 agent 会话，支持 cron |
| dsh-better-sidebar | fork omdsh-dev/DSH-better-sidebar（4.9k★） | 推荐位 | 无（sidebar_open 工具 opt-in 默认关）；按会话隔离的右编辑器侧栏，eval 5/5 PASS，已入索引 62 件 |
| @modelcontextprotocol/server-memory | 自研纯配置 bundle（插官方 dsh-mcp-client 行） | 已实测（plugweb bundles 层拉起 stdio server） | 需本机 node/npm；官方 memory 知识图谱 MCP |
| @modelcontextprotocol/server-sequential-thinking | 自研纯配置 bundle | 已实测（bundle 拉起） | 需 node/npm；sequential-thinking 逐步思考 |
| chrome-devtools-mcp | 自研纯配置 bundle | 已实测（bundle 拉起） | 需 node/npm+Chrome；浏览器控制（高危面已标注） |
| github-mcp-server | 自研纯配置 bundle（streamable-http） | 已实测（无 token 时 disabled 静默跳过） | GITHUB_TOKEN env；未设自动停用（disabled: !!js） |
| @modelcontextprotocol/server-brave-search | 自研纯配置 bundle | 已实测（无 key 时 disabled 静默跳过） | BRAVE_API_KEY env；上游包已归档停更已标注 |
| drama-skills | vendored fork zenstory-ai/drama-skills@d8a9a9b（skill pack） | 已实测（plugweb skill 调用冒烟 PASS） | 11 技能全链：编排/原著/开发/写集/资产/图视频提示词/分镜/生产/剪辑/审查 |
| screenwriting-skills | vendored fork jtydhr88/screenwriting-skills@51115f1 | 已实测（同上） | 26 个 sw-* 编剧技能（47 本工艺书蒸馏），sw-workflow 编排 |
| short-drama | vendored fork 0xsline/short-drama@8979a42 | 已实测（同上） | duanju-craft + 8 工艺参考（钩子/卡点/爽感矩阵/合规）；上游名撞 zenstory 编排器已改 |
| screenwriter-skill | vendored fork Vi7QY/screenwriter-skill@cf22b23 | 已实测（同上） | 红果 Top100 审稿方法论；上游中文名已改 script-review |
| academic-research-skills | vendored fork Imbad0202/academic-research-skills@2e02041（skill pack） | 已实测（plugweb skill 调用 PASS） | 5 技能学术全链：深研/写作/审稿/编排/综述筛选（上游 Method-1 布局，shared 支撑树未随包） |
| nature-skills | vendored fork Yuan1z0825/nature-skills@69817e4（skill pack） | 已实测（plugweb skill 调用 PASS） | 24 技能：检索/引用/精读卡/科研绘图/翻译/审稿/润色等；5 文件 frontmatter 已折行，researchwrite 名保留 |
| cnki-skills | vendored fork cookjohn/cnki-skills@20d65f6（skill pack） | 已实测（plugweb skill 调用 PASS） | 10 技能知网操作链；驱动 mcp__chrome-devtools__* 需装 chrome-devtools-mcp |
| paperjury | vendored fork Spark-To-Paper-Skills/paperjury@53c75e8（skill pack） | 已实测（plugweb skill 调用 PASS） | 投稿前 AI 审稿压力测试（含 references/configs/scripts） |
| academic-humanizer | vendored fork AIScientists-Dev/academic-humanizer@94b88b2（skill pack） | 已实测（plugweb skill 调用 PASS） | 学术去 AI 痕迹；frontmatter description 已折行 |
| paper-search-mcp（宿主需 uv/uvx 在 PATH：`python -m pip install uv`） | vendored fork openags/paper-search-mcp@cab1b5c（dsh 官方 bundle） | 已实测（plugweb skill 调用 PASS） | uvx 拉起 paper-search-mcp，15+ 源检索；附 paper-search 技能 |
| mino-skill-commit | 自研 skill pack（ctx.skills provider） | 已实测（provider 注册+list/get 冒烟通过） | 无；commit-message 技能，rank 650 可被同名覆盖 |
| mino-skill-mino-release | 自研 skill pack | 已实测（同上） | 无；mino-release 部署发布速查技能 |

> 已剔除：mino-agent-team（自研纯配置挂载层）——0.2.5 上游把 agent-team 三件套转正并进默认组合，挂载职责消失；merge 官方行属耦合，不要。
>
> 已否决：dsh-super-code（dsh-xray C3 级：patch 运行时/改写系统提示/起网络服务/读凭据环境变量；21★ 单人作者、无第三方验证）。不并入推荐，避免品牌背书风险。
>
> **红线类（永不进精选，不管热度多高）**：改写压缩/上下文核心循环的（billion-context：空转扣费恶评，且其机制是禁用宿主 compaction 换自家层——核心手术位故障=烧 token）；以 order/无条件服从注入改写系统提示的"破甲"类（dsh-infinite-gen-4）；一切 C3 级运行时 patch。评判看**机制**不看出身：热度只证明装机量，代码扫描（缺 engines/直读 env/console.log）才是质量信号。
>
> **已验收外部件**：`cc-safety-net`（npm 直装，非本仓 vendored）——执行前守卫：拦 git reset --hard/push --force/越界 rm -rf/.env·SSH key 读取；实测 plugweb 内 .env 读取被 `secret.basename.env` 拦下、`explain` 裁决 git.reset-hard 与 powershell.remove-item-recursive-force-outside-cwd 均 blocked，命名目录删除正常放行，粒度正确。建议并入推荐位为 pilot/文件工具的高危面兜底。
>
> **社区候选（已调研未装）**：dsh-our-free-model（55.9k★ 免费模型车道，与 Magpie 同位竞争，评估备选）；dsh-pocket（2.2k★ 手机扫码远程，对比 @wenbin_wb/dsh-bridge）；hindsight/MemOS/OpenViking 等重型记忆系统（桥薄服务重，fish-memory 轻量原生召回够用则不动）。
>
> **版本 bump 已完成（2026-11 实测零报错）**：
> - meme 0.1.72→**0.1.76**（lib 与上游一致，仅 package.json 补 peerDep）
> - speak-up 0.2.8→**0.2.9**（移植上游 issue #8 两修：触发文案带「现在几点」行防白天当凌晨；
>   冷却按 assistant/message 真说了话记账，投递不算开口）
> - qq-link 1.4.7→**1.5.0**（移植：source 双形状读取修复；轮来源只认首次+跳过 runtime-context/
>   time-context 等搭车注入，修「窗口自聊误推 QQ」；管理接口 只认本人 包装防局域网 CSRF；
>   /notice 上报端点收戳一戳；client.js 换上游 1.5.0 六页签版仅保留 mino- 前缀 id）
> - mood 0.8.4→**0.8.5**（移植：判定提示词分三档防小情绪全判 0；mood 顶 ≥85/底 ≤40 半幅阻尼）
> tavern 上游 dsh-tavern 已 2.7.x 但系 MUV 引擎另一血缘（我们有跑团/地图/战斗它没有），换不换看特性对比，不算掉队。
>
> **dsh-our-free-model 2.1.0 实测（2026-11，本机中国直连出口）**：provider / 干净挂载（inject 只要 llm），live catalog 拉到 7 个免费车道模型 + 13 账号渠道。但匿名道**全军覆没**：beam-free=region-blocked（出口国家被拦），deepseek-v4.1-flash-free/mimo 等=429 全局限流（"subscribe to OpenCode Go"，retryAfter ~17.7h）。**结论：匿名道在此出口当前不可用，不替换 Magpie**；其剩余价值在账号渠道 hub（WorkBuddy 等登录池）与内嵌 Magpie 引擎跟进，待账号登录实测后再评。已装 plugweb 待复测（patch insert 行，dep ^2.1.0）。注：其 settings 面板会写 ~/.mino/our-free-model/{catalog,availability,stats}.json。

> **互斥/高危标注（Discover 元数据待办）**：QQ 三路（qqbot/im-QQ/qq-link+aurabot）同号互踢应标互斥；tavern ~58 工具与 bili 系 ~43 工具全量进每轮 schema 是实打实的 token 前缀成本，应标"重场景包"；pilot 真实输入控制+截图上云，应标"高危，先读说明"。

| mino-voice-input | 自研纯配置 bundle（官方 voice-input 四件套 insert） | 已实测（plugweb 真启零失败） | 首次使用下载 SenseVoice 运行时/模型（需网络） |
| @loserfox/distill | fork @loserfox/distill 0.1.0（BSD-3） | 已实测（plugweb 真启零失败） | 无；turn 结束后台 subagent 反思→自动写/更新 SKILL.md |
| dsh-team-conductor | fork dsh-team-conductor 1.6.0（MIT） | 已实测（plugweb 真启零失败） | 0.2.5 起官方默认 agent-team 即其后端（无需 mino-agent-team）；与官方 tool-agent-team 互斥（自带 team_*+别名面），patch 已含 disable；名册控制面/DoD 任务审议 |
| dsh-voice-mode | fork dsh-voice-mode 0.7.34（MIT） | opt-in 未默认挂载 | sherpa-onnx 原生依赖重（~数百 MB）；全双工语音/barge-in；默认走 mino-voice-input |
| dsh-bot | fork MJ-CJM/DSH-Bot dsh-bot 0.6.3（MIT） | 已实测（plugweb 真启零失败） | 无；多 Bot 名册+人设+长期记忆+群组协作+后台任务+凭据编辑 |
| dsh-proactive | fork dsh-proactive 0.3.2（MIT） | 已实测（plugweb 真启零失败） | 无；模型自订闹钟/冷会话唤醒/安静时段/每日预算 |
| @tencent-connect/dsh-qqbot | 腾讯官方 fork | 推荐位 | QQBOT_APPID/SECRET 环境变量 |
| dsh-qq-console-v2 | fork | 推荐位 | 设置卡片填 AppID/Secret |
| dsh-bili-whale | fork | 推荐位 | B站 cookie（插件引导） |
| dsh-bili-danmaku-lite | fork | 推荐位 | `pip install -r requirements.txt` + 直播间配置 |

## 待办（跨仓，勿忘）

### 安装包/运行时
- [x] `MINO_BUNDLES`：persona+image 已进安装包 bundle 列表；dev link 走 MINO_PLUGINS_DIR
- [x] ffmpeg：gyan essentials (GPL) 打进 primary-runtime/mino-bin，desktopNodeEnvironment 已 prepend PATH；pin sha256 60f467…
- [x] schedule：已在 web-app patch 挂载（@deepseek-ai/dsh-schedule + ui-schedule），无需动作
- [ ] browser-use：上游是 0-dep 能力包无现成 bundle 声明，需组合编排 + chromium runtime，二期单独立项
- [x] claude-agent-sdk：已核实 win-x64 package-set 零 claude 引用，发行产物天然不含
- [ ] Windows 代码签名证书（流程数周，尽早启动）

### 账号/服务
- [x] Turnstile：授权页查 /api/status，开了就渲染 CF 控件并透传 ?turnstile=
- [ ] mino-service 注册页端到端实机验证（注册→PKCE→发码→/models）
- [ ] New API 后台确认 RegisterEnabled + 新账号启动额度
- [x] 上游 new-api 5 commits：已 ff-merge 到 main，go build 通过

### 产品层
- [x] 首启 onboarding：Mino 卡内置"第一次见面"自我介绍（人设驱动）；凭据向导在文档
- [x] 插件推荐位：公开仓 mino-plugin-releases `plugins-v0.1.1`（28 个 tgz，含 oh-story-dsh）+ 文档页推荐清单；产品仓 mino-releases 只放安装包
- [x] 接入文档：mino.baby/docs 插件生态章节（已提交，待部署）
- [ ] 教程素材包：安装录屏脚本 + 话术 + mascot 截图素材（喂给小 UP 主）

### 补全（superagent 养鱼向）
- [x] im-watch source：src/sources/im.ts 消费 @xmanrui/dsh-im dshIm 独占接收契约（consumeInbound/replyChecked/historyChecked），已构建进包，默认 disabled
- [x] non-code prompts：社区调研完成——养鱼向已由社区覆盖（aurabot personas/、speak-up、fish-memory、bili-humanism），不再自写
- [x] persona 接线：核实为分层设计——人设卡全局注入叠加 worker 职位 prompt，prefix 不动；work 卡已用社区家规语料
- [ ] @xmanrui/dsh-im 侧 QQ/微信渠道的 exclusive-text-consumer 能力（上游契约目前只实现飞书/Lark）

### 候选评估
- [x] SillyTavern 卡导入通道：dsh-sillytavern（KamishiroRei/dsh-sillytavern fork）已进仓+推荐位

### 二期/三期
- [ ] relay + 配对码（手机连回用户自己桌面 host，proto 已铺好）
- [ ] 云 host orchestrator（付费档；idle drain + 休眠 + 配额）
- [x] dsh-dafeiyu 桌宠（已 vendor，Mino 帧已生成；helper exe 需 PyInstaller 或 Python 回退）

### 已验证事实备忘
- `cordis.patch.yml` insert 行 `name` 必须等于安装包名，否则静默不加载
- vendored 包已剥 peer/devDeps（上游 dsh-type-meta 未公开发布，装不了；运行时 host 注入）
- soul-md 内部命名空间保留上游名（数据兼容），仅包名/patch name 改 dsh-soul-md
- 本地分叉（对上游已报/待报 issue，重 vendor 时须回带）：
  - `ops lib/discovery/index.js`：`internal/update` 监听器签名三参 `(_config,_noSave,next)` 改两参 `(_config,next)`——cordis 4.0.5→4.0.6-alpha 之间砍掉 `noSave`（改走 `internal/commit`），上游按老契约写的监听器在 ≥4.0.6-alpha/4.1.0 上让全档 `settings.update` 抛 `next is not a function`（上游 issue T-Auto/dsh-ops#672 + PR#673 已提；注意 lib/ 被 gitignore，此改动只存在工作区与 tgz 产物）
  - `persona index.js`：`system-prompt/assemble` 监听器升三参 `(_assembly,context,next)` 并 `await next()` 取下游结果再变换——旧两参形不调 next 会 veto 整条装配瀑布（上游新版已是三参，这等于回带上游修法）
  - `oh-story lib/index.js`：`startActivation` 入参 `spec.request.{parent,prompt}` 拍平为顶层 `spec.parent/prompt`——宿主侧官方仓已把激活参数拍平（refactor 575606a3，发布在 0.2.2-rc 之后），上游插件还按嵌套形调，症状 `Cannot read properties of undefined (reading 'id')`（上游 issue/PR 见 zenstory-ai/oh-story-dsh）
- qqbot 系库拉入含 build 脚本的传递依赖，已在 pnpm-workspace.yaml ignoredBuiltDependencies

### 发版与防护
- 插件发版只走 `scripts/publish-plugins.sh plugins-vX.Y.Z`：先跑 `node scripts/verify-all.mjs`（打包全量、client id、许可、patch name、数量核对），草稿上传、逐件核对 sha256 后才公开；脚本拒绝写入产品仓 mino-releases。
- 产品仓 mino-releases 的 Latest 必须是 `v<semver>` 产品安装包：服务器 cron 会镜像它并清理旧文件（2026-11-01 插件 release 被标成 Latest 导致官网安装包被删）。
- CI（.github/workflows/ci.yml）每次推送跑 verify-all；mino-deploy 的 uptime 工作流每 30 分钟巡检线上入口，失败开 issue。
| dsh-creative-studio | vendored fork Ylight-cpu/dsh-creative-studio@5d3e733（图像/视频工作室 2 skill + toolkit/cs.py） | 已实测（agent 真处理图片落盘 + rembg 抠图直测） | 宿主需 python+Pillow/rembg/onnxruntime/imageio-ffmpeg |
| dsh-scholar-suite | vendored fork docsor1212/dsh-scholar-suite@cd87473（学术工具链 8 skill：图表/去AI味/润色/引文核验 + 斜杠命令） | 已实测（skill 通路 + 600DPI 科研图直出验证） | 宿主需 python+matplotlib/scipy/pillow |
| humanizer-zh | vendored fork op7418/dsh-guizang-design@d16cea6 提取 skills/humanizer-zh（上游仓 AGPL-3.0+商业授权条款，**暂缓上架索引**） | 已实测（plugweb skill 通路） |
| guizang-social-card-skill | vendored fork op7418/dsh-guizang-design@d16cea6 提取 skills/guizang-social-card-skill（上游仓 AGPL-3.0+COMMERCIAL_LICENSING 商业授权条款，**暂缓上架索引**） | 已实测（plugweb skill 通路） |
