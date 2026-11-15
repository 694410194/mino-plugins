# mino-content-ops

内容运营技能包（4 个 skill，经真实素材端到端验证）：

- `content-collect`：热榜与 AI 资讯采集（AIHOT 全家桶含订阅池端点 + 实测直连可用的微博/头条/百度/B站热榜 + 少数派 RSS）
- `video-breakdown`：对标视频 → 复刻配方（场景检测 + contact sheet + ASR + 结构公式/节奏参数/换皮变量）
- `copy-style-mimic`：文风指纹模仿（量化指纹 → 双稿对照 → 去AI味，路由 `$humanizer-zh`）
- `video-shotcraft`：电影感产品视频制作（vendored Vincentwei1021/video-shotcraft@6700db2，Apache-2.0 镜像零改动；Remotion 工作台+124 镜头卡+八阶段流水线+声音设计）

验证锚点：224s 真实爆款片 → 13 段结构配方；123 段样本 → 文风指纹定稿；采集端点当日 curl 实测；shotcraft 渲染真机验证过成片。

## 已排除的 GPU 项 → 替代方案

不做本地 GPU 推理；以下能力走云端 API，只需用户自配 key（连通性已实测，未经 key 端到端验证）：

| 原 GPU 需求 | 替代通道（本机直连实测） | 状态 |
|---|---|---|
| 声音克隆（CosyVoice/GPT-SoVITS 等本地模型） | MiniMax 语音克隆 `api.minimaxi.com`；阿里百炼 CosyVoice 克隆 `dashscope.aliyuncs.com` | 需 `MINIMAX_API_KEY` 或 `DASHSCOPE_API_KEY` |
| 数字人口播（SadTalker/Wav2Lip 等本地推理） | 阿里百炼数字人/视频生成 `dashscope.aliyuncs.com`；百度智能云 `aip.baidubce.com` | 需 key；另一路线：不用数字人——B-roll+配音+卡片已成片验证 |
| 配音 TTS | 包外由 `dsh-voice` 插件覆盖（Edge TTS，v5 成片已用） | ✅ 已验证 |
| SFX 音效 | Freesound API | 需 key |

连通性实测（当日）：MiniMax/ElevenLabs/百度/阿里百炼主站可达；fish.audio、HeyGen、D-ID、即梦、腾讯智影、硅基智能本机直连超时或拒绝——不在替代清单内。
