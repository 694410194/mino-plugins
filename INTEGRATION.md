# Mino 整合包集成清单

主仓插件全部以官方 `dsh.bundle` + `cordis.patch.yml` 机制解耦，零内核改动。

## 本仓包（packages/）

| 包 | 来源 | 预装? | 首次配置 |
|---|---|---|---|
| mino-image | 自研 (Apache-2.0) | 是 | 无（走账户额度） |
| mino-persona | fork dsh-soul-md | 是 | 无（Mino 卡已预置为默认） |
| mino-qqbot | 腾讯官方 fork | 推荐位 | QQBOT_APPID/SECRET 环境变量 |
| mino-qq-console | fork | 推荐位 | 设置卡片填 AppID/Secret |
| mino-bili-whale | fork | 推荐位 | B站 cookie（插件引导） |
| mino-bili-live | fork | 推荐位 | `pip install -r requirements.txt` + 直播间配置 |

## 待办（跨仓，勿忘）

### 安装包/运行时
- [ ] `MINO_BUNDLES` 加入首发包（apps/desktop/src/project-manager.ts），建议首发 persona+image
- [ ] ffmpeg LGPL 构建打进 primary-runtime（B站/语音类插件公共依赖）
- [ ] 评估上游 schedule 包是否启用（bili-whale 自带生物钟可能够用）
- [ ] browser-use 包组启用评估（上游 cordis 行）
- [ ] 裁 @anthropic-ai/claude-agent-sdk 非 OSS provider 路径（发行前必须）
- [ ] Windows 代码签名证书（流程数周，尽早启动）

### 账号/服务
- [ ] mino-service 注册页端到端验证 + Turnstile 兼容（New API 若开启）
- [ ] New API 后台确认 RegisterEnabled + 新账号启动额度
- [ ] 吸收上游 new-api 5 个 task-plugin 提交（下次镜像升级）

### 产品层
- [ ] 首启 onboarding：默认工作区、教学首会话、QQ/B站凭据配置向导
- [ ] 插件精选清单/推荐位（dsh-mino 层或内置页，勿裸市场）
- [ ] 《Mino 接入文档》官网页（mino-deploy/site/docs/）：插件安装、推荐清单、与上游差异
- [ ] 教程素材包：安装录屏脚本 + 话术 + mascot 截图素材（喂给小 UP 主）

### 二期/三期
- [ ] relay + 配对码（手机连回用户自己桌面 host，proto 已铺好）
- [ ] 云 host orchestrator（付费档；idle drain + 休眠 + 配额）
- [ ] mino-pet 桌宠（fork dsh-dafeiyu 换自有吉祥物，锦上添花）

### 已验证事实备忘
- `cordis.patch.yml` insert 行 `name` 必须等于安装包名，否则静默不加载
- vendored 包已剥 peer/devDeps（上游 dsh-type-meta 未公开发布，装不了；运行时 host 注入）
- soul-md 内部命名空间保留上游名（数据兼容），仅包名/patch name 改 mino-persona
- qqbot 系库拉入含 build 脚本的传递依赖，已在 pnpm-workspace.yaml ignoredBuiltDependencies
