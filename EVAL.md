# Mino 精选评测档案（严格模式）

规则：**没有运行验证过的插件不给分**；每条结论必须能指到证据（原始事件/日志/上游 issue）。
分数 = 工程质量(25) + 安全面(25) + 冲突面(20) + 成本(15) + 维护度(15)。
评级：A≥85 推荐位｜B≥70 可用｜C≥55 谨慎｜D<55 不建议｜FAIL 验证失败｜REJECT 红线。

## 预测试 bug 登记册（全网搜到的已知缺陷，测试用例必须覆盖）

### 平台级（所有插件共享的宿主风险，非插件自身缺陷）
- P1 无插件故障隔离：一个坏插件拖垮整个应用（dsh#5426, #5106）
- P2 npm 安装会修剪核心 dsh-* 包 → ERR_MODULE_NOT_FOUND（dsh#3230）
- P3 git 源插件缺 dist/ → plugin tree 崩（dsh#3154）
- P4 profile node_modules 修复断于 0.1.7-rc.1 → 子进程/worker 死（dsh#7635）
- P5 profile package.json UTF-8 BOM → 启动崩（fish-memory 文档）

### 插件级已知 bug
- **billion-context（黑名单，非精选但红线备案）**：#156 小模型对确定性失败的 compress 参数原样重试、烧满 10 轮真实上游调用=空转扣费实锤；#103 图片计价错用 node.tokens → 负 messageTokens → 会话永久卡死；另有 rollout 灰度分桶（服务端不可见开关）
- **mino-pet(dsh-dafeiyu)**：#88 Windows 首启 108MB 自解压+60s 超时+杀软扫描→角色不出现；#39 缺依赖启动失败/WSL2 卡死系统；#76 迁移丢角色尺寸配置
- **mino-voice(dsh-voice)**：#9794 edge-tts DRM 升 v2（SEC_MS_GEC 复合摘要+MUID 改 Cookie）→ 旧实现全 403。【我们探针产出过 jiayou.mp3 → 实测再定】
- **mino-im(@xmanrui/dsh-im)**：#7590 未声明 webServer inject → 0.1.7 起激活失败（我们 lineage 不同，待验）
- **mino-qqbot(tencent-connect)**：C2C 消息收不到；#82 时间戳丢；#16 无主动推送钩子；#43 cwd/preset 配置被框架层吃掉（插件内兜底 workaround）
- **mino-tavern(KamishiroRei/dsh-sillytavern)**：ST 血缘。上游 MUV 系曾泄 worldbook/nsfw 进非酒馆会话（隔离 bug）→ 必测：非酒馆会话工具/schema 是否被污染
- **mino-browser(dsh-browser)**：#108 **任意已装扩展可 chrome-extension:// Origin 免 token 连接**（认证绕过）；#134 0.2.1-rc.3 peer arity；#96/97 bridge 发现 CORS。我们的 fork 已加 when 门控
- **mino-bridge(dsh-bridge)**：#82 session-strip 路径不匹配 → /api/session/list 全量传输+~8.5s 重连循环；#77 实时状态 0.2.1-rc.2 坏；#76 adminToken CORS 拒→管理操作静默失败；#75 无密码开隧道静默失败
- **mino-oh-story**：#50 snapshot.queue TypeError 崩工作台槽（0.1.10 已修）
- **mino-whale-musume**：#3 设置入口死链（文本匹配图标按钮）；bundle 模式缺设置面板；#32 engines.dsh 未覆盖 0.2.1-rc.3（我们已扩到 0.2.2-alpha.2）
- **fish-memory**：上游 1.3.6 修：session.v4 识别、{{...}} 模板注入崩（interpolate:false）、purgeEpoch 竞态、remember 全局注册（我们已改 agent/created）、子代理排除。【我们的 fork 是否含 1.3.5/1.3.6 修复待核】
- **speak-up**：0.2.9 已移植（issue #8：时间行+冷却按真说话）
- **qq-link**：1.5.0 已移植（issue #29：戳一戳+管理接口只认本人+搭车注入分类）
- **bili-scroll**：上游活跃（2.3.x），duty minimal profile + 收窄 IO 工具的独立安全模型
- **qq-console/aurabot/balance/status/open-sea/mood/persona/comma/superagent/bili-humanism/bili-live/bili-whale/image/market**：无社区信号，全靠实测定分

## 评分表（证据驱动）

运行验证基座：plugweb 全插件合成（含 superagent+comma）零 pending 启动；137 工具零重名；
14 条真实探测 + comma-router 真实轮次 + superagent orchestrator API 实测。
工具数 = 该插件注入每轮 schema 的工具数（request/header 实测）。

| 插件 | 分 | 级 | 工具 | 实测结论 |
|---|---|---|---|---|
| **persona** | 88 | A | 6 | 全会话一致身份注入；soul_*+memory_* 无撞名；本体，必装 |
| **fish-memory** | 82 | A- | 1 | remember 真实调用+跨会话召回✓；agent/created 挂载已加固；⚠ 待核 {{..}} interpolate:false（上游 1.3.5 修复） |
| **superagent** | 76 | B+ | 0 | orchestrator sqlite+API 实测活；worker preset 就绪；自研推荐位 |
| **mood** | 76 | B+ | 0 | 0.8.5 移植后启动干净；情绪判定为后台件；本体默认开 |
| **speak-up** | 74 | B+ | 0 | 0.2.9 移植；试运行模式可安全验证；user 角色限制是宿主硬约束 |
| **meme** | 74 | B+ | 4 | send_meme 真实发出✓；lib 与上游 0.1.76 一致 |
| **qq-link** | 72 | B | 5(代理域) | 1.5.0 移植含管理接口门；QQ 全链路需 NapCat 未验 |
| **bili-scroll** | 72 | B | ~14 | bili_search/cover/comments 真实调用✓；engines 齐；重场景包标注 |
| **comma** | 70 | B | 0 | router 真实轮次+记事本+循环✓（自研 WIP，worker 委派未实现） |
| **voice** | 70 | B | 5 | TTS 真产 mp3✓（上游 #9794 DRM v2 403 风险：我方能跑=实现较新或路径不同，建议对上游 edge-tts 7.3.x 再核一遍）；STT 需外部 key 未验 |
| **browser** | 68 | B- | 0(门控) | when 门控生效：无连接时工具不出 schema✓；上游 #108 免 token 连接漏洞——我们的 gate 挡 schema 但连接面本身待单独核 |
| **open-sea** | 66 | B- | 0 | 主题皮肤渲染正常；纯 UI |
| **pet** | 62 | C+ | 0 | 上游 #88 Windows 首启 108MB 自解压+60s 超时风险；可选 |
| **whale-musume** | 62 | C+ | 0 | engines 已扩 0.2.2-alpha.2；上游 #3 设置入口死链（文本匹配按钮）我们的 client 待核 |
| **market** | 62 | C+ | 0 | 社区目录入口实测可浏览；16 个文件直读 process.env 卫生差 |
| **balance** | 58 | C | 0 | 余额 UI 未深度验证 |
| **status** | 58 | C | 0 | 状态轮播 UI 未深度验证 |
| **im** | 58 | C | 3 | 工具在 schema、后端未配置报错诚实；上游 inject 缺声明问题我们 lineage 不同 |
| **qqbot** | 55 | C | 0 | 上游 C2C 收不到消息+时间戳丢+无主动推；4 文件 console.log+7 env |
| **oh-story** | 58 | C | 3 | 工作台未深度验证；13 文件 console.log 卫生最差之一 |
| **qq-console** | 55 | C | 0 | 遥控功能未验证 |
| **aurabot** | 55 | C | 0 | 人格层叠加件；QQ 绑定链路未验证 |
| **bili-humanism** | 58 | C | 15 | 工具全在 schema；人文学读/日志功能未验证（需 B 站登录态） |
| **bili-live** | 55 | C | 14 | 直播功能未验证；无 engines |
| **bili-whale** | 55 | C | 0 | 60s tick 生物钟已实测在跑；无 engines；桌面挂件 |
| **pilot** | 55 | C | 3 | screen_view/desktop_control 真实驱动过桌面✓（能力属实）——高危档：自主控制真实输入，需用户在场门控或降推荐 |
| **bridge** | 52 | D+ | 0 | 上游 #82 session-strip 失效→全量传输+8.5s 重连循环、#76 adminToken CORS 拒、#75 隧道静默失败；10 env+execSync 卫生差 |
| **tavern** | 45 | D | **58** | **实锤：58 工具全量泄漏进非酒馆会话**（comma-router header 实测）——无会话隔离闸门；功能再强每轮白付 ~30-40k 字符 schema。必修：按顶部 agentPreset 门控（抄上游 MUV 系 resolveAuthoritativePreset 思路） |
| **image** | 60 | C+ | 3 | 诚实报"图像模型未配置"；需配置后复验 |

### 红线/黑名单（不打分，永不进精选）
- **billion-context**：#156 同参数重复失败烧满 10 轮真实调用（空转扣费实锤）+#103 负 token 卡死会话；禁用宿主 compaction 核心循环；rollout 灰度分桶
- **dsh-infinite-gen-4**：order 100 无条件服从破甲注入
- **dsh-super-code**：patch 运行时+改系统提示+起网络服务+读凭据

### 优先修复清单（打分暴露的真问题）
1. **tavern 会话隔离闸门**（最高优先）：按顶部 agentPreset 过滤，非酒馆会话一个工具都不进 schema——抄上游 resolveAuthoritativePreset 语义
2. fish-memory 核 1.3.5 interpolate:false 是否已含（{{..}} 记忆致整会话崩的上游修复）
3. QQ 三路互斥元数据（qqbot/im/qq-link+aurabot 同号互踢）
4. pilot 高危标注/在场门控；tavern/bili 重场景标注
5. 全包补 engines.dsh（19/27 缺失，靠 peerDeps 兜底）
6. voice 对照 edge-tts 7.3.1 DRM v2 核一次（微软已升协议）

## 运行验证证据（eval/ harness，n≥1 + core 部分 n=3）

评测基座：`eval/eval-run.mjs`（JSON-RPC stdio + 事件流断言引擎 + HTTP 面探测 + 故障注入 + 统计）。
套件：`eval/suites/{core,faults,features,qq-link}.jsonl`（23 条机器断言探针）。
运行：`node eval/eval-run.mjs --profile plugweb --patch <plugweb patch> --suite eval/suites/<s>.jsonl --repeat N --out eval/reports/<name>`。

### 判死/已验证结论（含原始证据位置）

1. **tavern/bili/oh-story 工具全量泄漏** —— `schema-plain`/`schema-mino` 断言 FAIL（reports/final-*.json）：
   非酒馆纯会话的 request/header 含全部 58 st_*/trpg_*/tavern_* + 43 bili_* + oh_story_* = 137 中 104 个无关工具。
   **修复项 #1**：按顶部 agentPreset 门控。注：`request/header` 仅会话首轮发出（schema 快照语义），
   LLM 调用数应按 step/start 计。
2. **fish-memory 对 {{user}} 毒记忆免疫** —— `mem-poisoned-turn`+`schema-mem-poisoned` PASS：
   字面量注入进上下文（interpolate:false 行为），会话存活、无 session/turn error、无模板回显。
   上游 1.3.5 崩会话 bug 不存在 → 回归断言已入册。
3. **qq-link 鉴权链全部实测** —— 5/5：未认证 POST /save → 200 包体 `authentication_required`（只认本人门生效）；
   /receive 公开口可达+语义校验；superagent API = token→cookie→x-orchestrator-request+origin 三层（200/403/401 各自验证）。
   ⚠ 发现：宿主 webserver **只放行 GET/HEAD**——/receive、/notice 的 POST 面是死面，NapCat 只能被轮询不能被推送。
4. **comma 主动循环开销实测**：65s 空闲 = 1 次模型调用（comma-router 会话），bg.modelCalls≤2 预算内。
5. **voice TTS 4/4 实测**（~5s 稳定）；**bili_search 4/4**（8-46s，冷启动慢）；**remember→跨会话召回**多轮稳定。
6. **image 诚实降级**：generate_image 报错后模型如实披露"未配置"并可走 SVG/手画兜底（行为合格但路线不定 → flaky 属模型行为非缺陷）。
7. **pilot 能力属实**（screen_view/desktop_control 在 schema）；oh-story/meme/soul/im 工具在册。
8. **引擎卫生扫描**：19/27 包缺 engines.dsh（靠 peerDeps 兜底）；oh-story 13 文件 console.log、qqbot 7 env 直读、market 16 env 直读。

### 流程缺陷修复记录（harness 自身——假阴性比假阳性危险）

- spawn cmd.exe 包装 + kill() 只杀壳 → Mino.exe 孙子孤活占端口/锁 → taskkill /T 整树
- session.status 'idle' 是 attach 时快照（轮间 7ms 间隙会假阳性）→ 需 turn/start 先见才认
- session/query 响应到达时历史事件已在缓冲 → preDone 需"同轮 turn/start 在前"配对
- status.final 断言改"曾到达"语义 + turn/end 后 400ms 宽限
- webBase 尾斜杠 → //?token= 400；token 只在 GET / 换 cookie，API 靠 cookie 鉴权
- dsh cwd 绑定 workspace：spawn 须钉 cwd 到 profile 工作区，否则 comma-router 报 domain inconsistent

### 修正后评分（只列变化的）

| 插件 | 原→新 | 依据 |
|---|---|---|
| qq-link | 72→**76 B+** | 鉴权链 5/5 实测；POST 死面已记档（轮询兜底） |
| superagent | 76→**78 B+** | API 三层鉴权实测；policyVersion 真实返回 |
| fish-memory | 82→**83 A** | {{user}} 注入免疫实测 |
| image | 60→**64 C+** | 诚实降级实测（报错→披露→可选兜底） |
| tavern | **45 D** 维持 | schema.absent 机器断言 FAIL 实锤，修复项#1 |
| comma | **70 B** 维持 | 开销实测合预算；worker 委派仍缺 |

## tavern 隔离闸门修复（1.0.0 → 1.1.1，回归断言验证）

- **机制**：`tavernWhen(state)`（lib/session.js）喂 `ctx.tools.register(def,{when})`——
  装配期按 `agent.session.id` 查 `binding.entered===true` 才放行。
  门控 51 个工具（7 个文件 53 处调用点）；入口/setup 面 7 个保持开放：
  tavern_enter/lobby/state + st_import_character/sillytavern/worldbook/st_list_st_sources。
- **坑**：getBinding 对新会话回退继承 lastCharacter——门必须看 `entered` 显式标记，
  看 characterId 会在玩过一次后对所有会话敞开。
- **验证**：`schema-plain`/`schema-mino` 从 FAIL×6 → **PASS**（reports/gate-v3、core-v4-gated）；
  非酒馆会话 137→86 工具；入口面 schema.present 断言保住。
- **副产品暴露**：bili_ 43 + oh_story_ 3 是另外两家的常驻特性面（设计内，成本已标注）；
  schema-heavy-cost 探针文档化该开销（tools.max:90 门线）。

### tavern 评分修正：45 → **70 B-**
闸门修复 + 回归断言转绿；仍缺玩法深测（角色卡/世界书装配/跑团实战）与 engines.dsh 声明。

## 13 个 vendored 社区 fork 实测（reports/run-mvyyrvp6 + boot 证据）

装载修复（vendoring 时引入的问题，已修）：
- **ops cordis.patch.yml**：`name: "mino-ops"/mode-*` 是非法 YAML（引号没包住斜杠）→ 全改为 `"mino-ops/mode-*"`。上游 vendoring 重命名时把 unquoted scalar 截断进引号。
- **5 包版本门拒载**：peerDependencies/engines.dsh 声明停在 `0.2.1-rc.*`（drawio/notes 还是 `0.1.0-rc.6` 时代）→ 追加已验证线 `>=0.2.2-alpha.1 <0.2.3`（AGENTS.md 扩线策略）。
- **skillhub**：lib/*.js 内嵌 TYPERT manifest `package: "@astron-team/skillhub-dsh"` 没跟着改名 → typert-loader 拒注册。改 `mino-skillhub`。
- **safety-net**：root 入口是 OpenCode 插件（`{server}` 导出形状），DSH 适配器在 `dist/deepseek-harness/index.js` → 补 `"./deepseek-harness"` exports 子路径，patch row 指向它。
- **dsh-artifact-services**（knowledge-studio 附属）：需 `DSH_OFFICE_NODE` env → eval harness 注入 primary-runtime 自带 node。

### 13 件评分（6/8 功能探针过 + 全量激活验证）

| 件 | 分 | 级 | 实测证据 |
|---|---|---|---|
| skillhub | 76 | B | 10 个 astron_skillhub_* 工具全注册；list_installed 真实调用 PASS |
| ops | 74 | B | **延迟发现网关**设计（1 个 ops_discover_tools 入口，ops_glob/grep/write_file/edit_file/stat/read_table 按需入场——schema 卫生比 tavern 好一个量级）；枚举全目录花 16 call 是模型啰嗦非缺陷 |
| task-board | 70 | B- | 8 工具注册，task_board_list 真调用 PASS |
| drawio | 68 | B- | drawio_render 真产 PNG；drawio_template 返回空模板（小缺口） |
| visualize | 66 | B- | visualize 真调用渲染 |
| notes | 62 | C+ | notes_export_conversation 真调用 |
| damage-pulse | 62 | C+ | token_monitor_balance_get 真调用 |
| chat-import | 60 | C+ | import_chat schema 在；深度导入未测 |
| safety-net | 60 | C+ | hook 型无工具（设计内）；入口修复后 import 干净；拦截实测未做 |
| skill-explorer | 58 | C+ | UI 件，装载干净无错 |
| skin-market | 58 | C+ | UI 件，装载干净无错 |
| rewind | 58 | C+ | UI 件，装载干净无错 |
| **knowledge-studio** | **35** | **D** | **LadybugDB native 绑定 Node ABI——Electron 44（ABI 149）宿主必炸**，0.20.1/0.22.1 都试过；普通 node 宿主可。Mino 桌面=Electron=不可用 |

### 架构事实（钉死）

- Mino 桌面宿主 = `Mino.exe` + `ELECTRON_RUN_AS_NODE=1` = Electron 44，**NODE_MODULE_VERSION 149 ≠ Node 24 的 137**。所有带原生 .node 依赖的插件在此宿主必须 Electron-ABI 重建，否则必炸。knowledge-studio 是首个中招者。
- 索引侧已全标：`upstream-risk`+`needs-config`+`heavy` 打 knowledge-studio；`high-risk` 打 safety-net（拦命令）；其余 verified。

## 7 个自研 bundle 实测（reports/run-mvyz2vgc + safety-v2）

- **mcp-memory 72 B**：npx 拉起官方 memory MCP，9 个 `mcp__memory__*` 工具实时入 schema
- **mcp-thinking 70 B**：sequentialthinking 工具入场
- **mcp-chrome-devtools 66 B-**：37 个 `mcp__chrome__*` 工具——能力真实但工具面最重（heavy+high-risk 已标）；**已默认追加 `--no-usage-statistics`**（上游 Google 遥测 opt-out，启动横幅自曝会收集使用统计）
- **mcp-github 60 C+** / **mcp-brave-search 58 C+**：`disabled: !!js` 无 key 自动停用验证通过（schema 无工具、启动无错）；实功能需 key 后复测
- **skill-commit / skill-mino-release 60 C+**：provider 挂载无错（skill catalog 注册，非工具面）

### safety-net 拦截实锤（safety-v2，60→68）

`read` 调 `~/.aws/credentials` → 插件在工具层拦截，模型回复"安全防护直接拦下了"，假密钥标记零泄漏。
会话 cwd 内的 `Remove-Item -Recurse -Force` 放行是**策略内**（scope 内删自己工作目录合法），不是拦截失效。

### 待办：索引收编

7 包已推 github（`f78d089`）。入索引需服务器两步：
1. `build-plugin-git-repos.sh`（给新包铸 snapshot 裸仓——commit sha 只能在服务器现场产生）
2. 重新生成 index.json + `node eval/enrich-index.mjs`（annotations 已备齐 47 条）

## mino-better-sidebar 评测（0.28.2 vendored fork，2026-11-04，reports/better-sidebar-v5）

- **vendoring 变更**：包名 → `mino-better-sidebar`；`lib/index.js` 仅一处功能改名
  `SIDEBAR_PACKAGE_NAME`（ownEntryId 按 `options.name` 反查 loader 行，不改设置面失效）；
  cordis.patch.yml row name 改 + 双挂载守卫扩为同时匹配 `dsh-/mino-` 两名；
  `engines.dsh >=0.2.1-rc.1 <0.3.0-0`；`mino.upstream=dsh-better-sidebar@0.28.2`。其余零改动。
- **5/5 PASS**（suite `eval/suites/better-sidebar.jsonl`，patch `eval/patches/better-sidebar.yml`）：
  `/sidebar/api` 未授权 → 403 `forbidden`（fence=connection.requestRejection 与 /api 同闸）；
  授权 settings.get → 200，`agentOpenTools:true` 种到（config 种子生效+设置面找到 loader 行）；
  `sidebar_open` 入 schema（opt-in，默认 `agentOpenTools:false` 不注册——**默认零 schema 成本**）；
  模型真实调用 → `tool/result` isError:false，cwd 相对路径解析正确，无视图连接时按设计入队。
- **机制注意**：工具注册是惰性的——gate 在 settings face 首次被读时才同步
  （v1/v2 实锤默认态 schema absent）；套件内 settings.get 探针必须先于 schema 断言。
- **卫生面**：9 env（DSH_HOME/WSL/debug 全功能性）、1 console（debug 门控）、
  **58 裸 child_process**（git/外部编辑器/归档——绕开宿主沙箱，安全面扣分项）；
  `open.external` 可拉起系统应用（POST+auth 闸后）；`htmlViewerNoSandbox` 默认关。
- **评分 ~82 A-（推荐位候选）**：工程 21/25（成熟 typed 码、C1/C4/C6/C10 工具规范、
  双挂载守卫；惰注册+裸 spawn 扣分）· 安全 19/25（全路由 fence+POST only，
  spawn 面大扣分）· 冲突 18/20（官方 tab 注册缝走法、1 工具零污染、守卫双向）·
  成本 14/15（默认零工具、按需 watcher）· 维护 13/15（上游极活跃、pin 表清晰、
  163 issue 属正常积压；#947 worktree 路径拼接、#238 SSH 远端不兼容留档）。
- **客户端面未验边界**：UI 本体（侧栏页签/底部面板渲染）stdio 探针够不到，
  同其他 UI 件惯例按"装载无错+宿主面实测"定级；真机浏览器验证待做。
- **上游 issue 红线扫描**：无安全/烧钱类实锤；双挂载 FAQ 已有（守卫覆盖）。

## 环境实锤两条（2026-11-04，plugweb on dsh 0.2.5）

1. **装机运行时已到 0.2.5，精选目录 engines 大面积到期**：plugweb boot 实录
   ~30 件 `engines.dsh <0.2.3` 被 disable/skip（全部 skill-*、mcp-*、creative-studio、
   notes、oh-story、comma、scholar-suite、ops 五个 mode、token-monitor、damage-pulse、
   distill、team-conductor、proactive）。按 AGENTS 扩线纪律需全目录复测扩门，
   否则 0.2.5 装机用户装精选=静默不挂载。
2. **mino-bot 0.1.1 memoryAdmission 对非 bot 会话持久全局阻断**：`agent/pre-step`
   + `llm/stream` 闸在 `assertAllowed` 抛 `Memory admission blocked`，
   turn/end reason=error、模型零调用。45s 预热不恢复 = 非启动竞态是持久态
   （kernel 未就绪/被 blocked 即永锁；`startupFailed` 放行需 presetKnown+非 bot 前缀）。
   plugweb 探针会话全灭（v1-v4 复现）；`4d13aa2` 修的启动失败路径未覆盖此形态。
   **评测 overlay 里 `- id: bot disabled: true` 可复现干净环境。**
   同类面：bot 在用户装机精选目录内（index 含它）——若线上形态同此，
   用户正常会话在 kernel 未就绪期间同样被锁，按事故级处理立案。

### mino-bot 阻断根因定案与修复（0.1.2，2026-11-04，reports/bot-dbg2、bot-fix-a/b/c）

- **根因 1（触发源）**：`owner-lease.js ensureLeaseDirectory` 对 `resolve()`
  出的绝对路径 `split('/')`——Windows 返回 `\` 分隔 → 整串当一个组件 →
  单级 `mkdir` 深路径必 ENOENT。`~/.dsh/dsh-bot/memory-owner` 永远建不起来，
  bot 存储在 Windows 上**首 boot 必死**（Linux 上 `resolve` 出 `/` 路径正常，
  上游 dsh-bot@0.6.3 的 Windows 潜伏 bug）。修：split 兼容双分隔符。
- **根因 2（全局锁）**：`4d13aa2` 的 startupFailed 放行门
  `startupFailed && !stopped` **永远不满足**——initialize() catch 先跑
  `shutdown()`（`memoryAdmission.close()` → `stopped=true`）才轮到外层
  catch 记 `startupFailed=true`；且 `markStartupFailed` 的 `!ready` 守卫
  让 start() 之后的失败连标记都不打。修复：标记无条件记 + 放行门去掉
  `!stopped`（startupFailed 即终态，closed 态同样永产不出 managed agent）。
- **复现证据链**：注入安装件埋点（安装件带逐文件 SHA-256 完整性校验，
  改文件必须同步 manifest hash）→ `bot-dbg2.boot` 实录
  `startupError: ENOENT mkdir '...\dsh-bot\memory-owner'` 与
  `blocked: {stopped:true,ready:false,startupFailed:true,hasKernel:false}`。
- **验证**：A) 修复后冷 boot，`memory-owner/owner.json` 建成、kernel ready；
  B) 人为坏库（dsh-bot 置文件）→ 启动失败 → 非 bot 会话经放行门真实应答；
  C) 删库冷 boot + 40s → `turn/end completed` 真实回复。
- **残余语义（上游设计，保留）**：启动窗口内未知归属会话仍 block
  （`turn/end reason.kind=error`——eval 断言须看 reason 不是 turn/error 事件）；
  kernel.blocked 为暂态对账语义不属于释放范围；preset 不可判定的会话
  startupFailed 下仍保守阻断。

## 0.2.5 全目录实测与扩线（2026-11-04，reports/compat-sweep-1、proactive-verify-2、mcp-verify-1）

- **实测法**：31 件 `<0.2.3` stale-range 插件 + mcp-client 走 profile
  `compatibility.json` 精确版本豁免强制装载 → boot + 模型调用实测。
- **结果**：31 件全部干净装载（sweep 模型探针通过、142 工具在册）；
  豁免只覆盖 0.2.5，非永久放行。
- **真缺陷 1（已修）**：mino-proactive 0.1.0 调上游已删 API
  `ctx.agents.roots()`（0.2.5 只有 `list()`+`session.header.parentSession`）。
  修复=版本自适应枚举（roots 在则用，否则 list 滤 parentSession），
  0.1.1 已发；proactive-verify-2 2/2 PASS（proactive_set/list 进 schema、
  普通调用正常）。
- **真缺陷 2（上游打包形态，豁免通道）**：`@deepseek-ai/dsh-mcp-client`
  peers 精确 pin 同版本号（0.2.0-rc.2/0.2.2-alpha.3 均精确），上游未发
  0.2.5 版 → 官方精确版本豁免是唯一通道（非 stale range）。
  mcp-verify-1：豁免后 6 条 mcp-* 行全活，chrome-devtools server 实拉
  30+ `mcp__chrome__*` 工具、共 193 工具在册 → **0.2.5 上功能实测正常**。
- **真缺陷 3（环境/原生，维持 gated）**：mino-knowledge-studio 的
  LadybugDB win32-x64 `lbugjs.node` DLL 初始化失败（提示 reinstall with
  optional dependencies）——本机原生运行时问题，engines 不扩。
- **experimental-agent-team / client-ui-agent-team**：profile 缺这两个
  上游 experimental 包（非 mino 件），team-agent/team-ui 相关行未挂载。
- **扩线**：31 件 `engines.dsh` 上界 `<0.2.3` → `<0.3.0`（oh-story、
  whale-musume 多子句归并单区间）。profile 安装件仍为旧 manifest，
  下次重装后 compatibility.json 里对应豁免可删。
