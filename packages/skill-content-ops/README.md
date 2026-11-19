# mino-content-ops

内容运营技能包（6 个 skill，经真实素材端到端验证）：

- `content-ops`：内容工场规范工作流——选题/调研/文稿/配方/成片/发布产物固定落位 `content-factory/` 目录树，自带文风卡种子库（seed/styles）
- `content-collect`：热榜与 AI 资讯采集（AIHOT 全家桶含订阅池端点 + 实测直连可用的微博/头条/百度/B站热榜 + 少数派 RSS）
- `video-breakdown`：对标视频 → 复刻配方（场景检测 + contact sheet + ASR + 结构公式/节奏参数/换皮变量）
- `copy-style-mimic`：文风指纹模仿（量化指纹 → 双稿对照 → 去AI味，路由 `$humanizer-zh`；文风卡直通指纹，references/ 含上游 MIT 七维框架与成稿公式）
- `video-shotcraft`：电影感产品视频制作（vendored Vincentwei1021/video-shotcraft@6700db2，Apache-2.0 镜像零改动；Remotion 工作台+124 镜头卡+八阶段流水线+声音设计）
- `social-publish`：多平台发布——官方 `browser-use` + `playwright-mcp` 栈 CDP attach 用户已登录浏览器，agent 像人一样点创作者后台（发布前用户确认）；机制链路已真验，各平台流程待真实登录态首验

验证锚点：224s 真实爆款片 → 13 段结构配方；123 段样本 → 文风指纹定稿；采集端点当日 curl 实测；shotcraft 渲染真机验证过成片。

## 挂载面（host + client 两半）

cordis.patch.yml 挂两行（id 独立、name 走 exports 子路径解析）：

- `mino-content-ops` → `index.js`：`ctx.skills.registerProvider` 注册 6 个技能（rank 650，可被用户/项目同名覆盖）
- `mino-content-ops/workbench` → `workbench.js`：`ctx.webServer.register` 挂两个 prefix 路由——`/dsh-shotcraft-workbench/*`（ShotCraft Workbench dev server 生命周期：status/open/stop，拉起上游 `skills/video-shotcraft/workbench/scripts/open.mjs`，不平行实现）与 `/dsh-content-ops/*`（ensure-workspace/scaffold/library，内容工场目录树与种子文风卡投放）；只允许本机回环
- 浏览器半 `client.js` 经 `dsh.client`（platform: web）自动加载：官方 `slots.inject` 注册「内容工场」（流水线中枢：热榜线索带 + 稿台队列 + 任务卡片）与「Agent 剪辑」（Workbench iframe + 生命周期条）两个全局面板；任务下发走 `ctx.sessions`/`ctx.uiWorkspace`/`ctx.workspaces` 官方服务缝，通知走 `shell.overlay` 座位

## 已排除的 GPU 项 → 替代方案

不做本地 GPU 推理；以下能力走云端 API，只需用户自配 key（连通性已实测，未经 key 端到端验证）：

| 原 GPU 需求 | 替代通道（本机直连实测） | 状态 |
|---|---|---|
| 声音克隆（CosyVoice/GPT-SoVITS 等本地模型） | MiniMax 语音克隆 `api.minimaxi.com`；阿里百炼 CosyVoice 克隆 `dashscope.aliyuncs.com` | 需 `MINIMAX_API_KEY` 或 `DASHSCOPE_API_KEY` |
| 数字人口播（SadTalker/Wav2Lip 等本地推理） | 阿里百炼数字人/视频生成 `dashscope.aliyuncs.com`；百度智能云 `aip.baidubce.com` | 需 key；另一路线：不用数字人——B-roll+配音+卡片已成片验证 |
| 配音 TTS | 包外由 `dsh-voice` 插件覆盖（Edge TTS，v5 成片已用） | ✅ 已验证 |
| SFX 音效 | Freesound API | 需 key |

连通性实测（当日）：MiniMax/ElevenLabs/百度/阿里百炼主站可达；fish.audio、HeyGen、D-ID、即梦、腾讯智影、硅基智能本机直连超时或拒绝——不在替代清单内。
