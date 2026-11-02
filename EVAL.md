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
