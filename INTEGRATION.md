# Mino 整合包集成清单

主仓插件全部以官方 `dsh.bundle` + `cordis.patch.yml` 机制解耦，零内核改动。

## 本仓包（packages/）

| 包 | 来源 | 预装? | 首次配置 |
|---|---|---|---|
| mino-image | 自研 (Apache-2.0) | 是 | 无（走账户额度） |
| mino-persona | fork dsh-soul-md | 是 | 无（Mino 卡已预置为默认） |
| mino-im | fork @xmanrui/dsh-im | 推荐位首选 | 扫码即建机器人；微信/QQ/飞书/钉钉/企微/TG/Discord/Slack/WhatsApp 9 渠道 |
| mino-voice | fork dsh-voice | 推荐位 | TTS 零配置；STT 需 ASR key（Groq 免费档可用） |
| mino-pet | fork dsh-dafeiyu | 推荐位 | Python + PySide6；鲸鱼素材保留可切换，默认 Mino 帧 |
| mino-superagent | fork 官方 superagent 原型 + im-watch 源 | 实验向推荐位 | SETUP 向导：bot 账号+准入名单+stateDir；源码在本仓用 tsdown 构建 |
| mino-tavern | fork KamishiroRei/dsh-sillytavern | 推荐位 | 无（预设选“酒馆跑团”）；ST V2/V3/PNG 卡+世界书+MVU |
| mino-market | fork dshmarket | 推荐位强推 | 无；官方市场可视化装全部社区插件（生态自助入口） |
| mino-aurabot | fork dsh-aurabot-qq | 推荐位 | OneBot/NapCat 个人号；QQ 鱼本体（聊天/表情/语音/记事/空间/B站/唱歌，模块化） |
| mino-qq-link | fork Yuuyuko-uu/dsh-qq-link（插件许可 1.2） | 推荐位 | OneBot 11/NapCat；QQ 双向桥 |
| mino-speak-up | fork Yuuyuko-uu/dsh-speak-up（同上许可） | 推荐位 | 无；主动搭话（本地掷骰子触发） |
| mino-mood | fork Yuuyuko-uu/dsh-feiyu-mood（同上） | 推荐位 | 无；心情系统+右下角挂饰 |
| mino-fish-memory | fork Yuuyuko-uu/dsh-fish-memory（同上） | 推荐位 | 无；会淡忘的带时间戳长期记忆 |
| mino-balance | fork dsh-whale-widget | 推荐位 | 无；鲸鱼娘余额挂件（余额/峰谷/飘字） |
| mino-status | fork dsh-status-rotator | 推荐位 | 无；状态栏梗+鲸尾动作 |
| mino-bili-scroll | fork dsh-bili-scroll | 推荐位 | B站 cookie；每日刷B站挑片写日报 |
| mino-bili-humanism | fork dsh-bili-humanism | 推荐位 | B站 cookie；人类世界内容养人格（human-world.md） |
| mino-meme | fork dsh-meme | 推荐位 | 无；表情包斗图+图库市场 |
| mino-bridge | fork @wenbin_wb/dsh-bridge | 推荐位 | 远程通道配置；扫码直连/隧道/多IM机器人+安全认证 |
| mino-browser | fork @yuxianglin/dsh-bridge-browser | 进阶推荐位 | 需装配套 Chrome 扩展；源码 tsc+tsdown 在本仓构建 |
| mino-pilot | fork @momasiku/dsh-pilot | 进阶推荐位 | Windows 桌面自动化；能力边界大先看说明 |
| mino-open-sea | fork open-sea-skin | 推荐位 | 无；海洋主题皮肤 |
| mino-whale-musume | fork dsh-whale-musume | 推荐位（与 pet 二选一） | 无；鲸鱼娘桌宠 45 成就+3 小游戏 |

> 已否决：dsh-super-code（dsh-xray C3 级：patch 运行时/改写系统提示/起网络服务/读凭据环境变量；21★ 单人作者、无第三方验证）。不并入推荐，避免品牌背书风险。
| mino-qqbot | 腾讯官方 fork | 推荐位 | QQBOT_APPID/SECRET 环境变量 |
| mino-qq-console | fork | 推荐位 | 设置卡片填 AppID/Secret |
| mino-bili-whale | fork | 推荐位 | B站 cookie（插件引导） |
| mino-bili-live | fork | 推荐位 | `pip install -r requirements.txt` + 直播间配置 |

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
- [x] 插件推荐位：公开仓 mino-plugin-releases `plugins-v0.1.0`（27 个 tgz）+ 文档页推荐清单；产品仓 mino-releases 只放安装包
- [x] 接入文档：mino.baby/docs 插件生态章节（已提交，待部署）
- [ ] 教程素材包：安装录屏脚本 + 话术 + mascot 截图素材（喂给小 UP 主）

### 补全（superagent 养鱼向）
- [x] im-watch source：src/sources/im.ts 消费 mino-im dshIm 独占接收契约（consumeInbound/replyChecked/historyChecked），已构建进包，默认 disabled
- [x] non-code prompts：社区调研完成——养鱼向已由社区覆盖（aurabot personas/、speak-up、fish-memory、bili-humanism），不再自写
- [x] persona 接线：核实为分层设计——人设卡全局注入叠加 worker 职位 prompt，prefix 不动；work 卡已用社区家规语料
- [ ] mino-im 侧 QQ/微信渠道的 exclusive-text-consumer 能力（上游契约目前只实现飞书/Lark）

### 候选评估
- [x] SillyTavern 卡导入通道：mino-tavern（KamishiroRei/dsh-sillytavern fork）已进仓+推荐位

### 二期/三期
- [ ] relay + 配对码（手机连回用户自己桌面 host，proto 已铺好）
- [ ] 云 host orchestrator（付费档；idle drain + 休眠 + 配额）
- [x] mino-pet 桌宠（已 vendor，Mino 帧已生成；helper exe 需 PyInstaller 或 Python 回退）

### 已验证事实备忘
- `cordis.patch.yml` insert 行 `name` 必须等于安装包名，否则静默不加载
- vendored 包已剥 peer/devDeps（上游 dsh-type-meta 未公开发布，装不了；运行时 host 注入）
- soul-md 内部命名空间保留上游名（数据兼容），仅包名/patch name 改 mino-persona
- qqbot 系库拉入含 build 脚本的传递依赖，已在 pnpm-workspace.yaml ignoredBuiltDependencies

### 发版与防护
- 插件发版只走 `scripts/publish-plugins.sh plugins-vX.Y.Z`：先跑 `node scripts/verify-all.mjs`（打包全量、client id、许可、patch name、数量核对），草稿上传、逐件核对 sha256 后才公开；脚本拒绝写入产品仓 mino-releases。
- 产品仓 mino-releases 的 Latest 必须是 `v<semver>` 产品安装包：服务器 cron 会镜像它并清理旧文件（2026-11-01 插件 release 被标成 Latest 导致官网安装包被删）。
- CI（.github/workflows/ci.yml）每次推送跑 verify-all；mino-deploy 的 uptime 工作流每 30 分钟巡检线上入口，失败开 issue。
