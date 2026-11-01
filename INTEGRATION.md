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
- [x] 插件推荐位：mino-releases `plugins-v0.1.0` 挂 8 个 tgz + 文档页推荐清单
- [x] 接入文档：mino.baby/docs 插件生态章节（已提交，待部署）
- [ ] 教程素材包：安装录屏脚本 + 话术 + mascot 截图素材（喂给小 UP 主）

### 补全（superagent 养鱼向）
- [x] im-watch source：src/sources/im.ts 消费 mino-im dshIm 独占接收契约（consumeInbound/replyChecked/historyChecked），已构建进包，默认 disabled
- [ ] non-code prompts：prompts/ 目前全是编码语境；先调研社区值守/陪伴向 prompt 包再决定写不写
- [ ] persona 接线：worker preset 的 dsh-persona prefix 是 coding agent 文案，换 Mino 人设
- [ ] mino-im 侧 QQ/微信渠道的 exclusive-text-consumer 能力（上游契约目前只实现飞书/Lark）

### 候选评估
- [ ] SillyTavern 卡导入通道：dsh-sillytavern-presets 或 dsh-tavern 全家桶，实机验证后进推荐位

### 二期/三期
- [ ] relay + 配对码（手机连回用户自己桌面 host，proto 已铺好）
- [ ] 云 host orchestrator（付费档；idle drain + 休眠 + 配额）
- [x] mino-pet 桌宠（已 vendor，Mino 帧已生成；helper exe 需 PyInstaller 或 Python 回退）

### 已验证事实备忘
- `cordis.patch.yml` insert 行 `name` 必须等于安装包名，否则静默不加载
- vendored 包已剥 peer/devDeps（上游 dsh-type-meta 未公开发布，装不了；运行时 host 注入）
- soul-md 内部命名空间保留上游名（数据兼容），仅包名/patch name 改 mino-persona
- qqbot 系库拉入含 build 脚本的传递依赖，已在 pnpm-workspace.yaml ignoredBuiltDependencies
