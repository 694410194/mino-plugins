# mino-media

Mino 媒体生成插件（全家桶）：视频、语音合成、语音转写、音乐，全部经 `mino-inference` 服务走 Mino 账号额度，消耗后台开通的模型。

## 工具

| 工具 | 用途 | 协议 |
|---|---|---|
| `generate_video` | 提交视频任务→轮询→下载→存工作区 | openai_video（`POST /v1/videos` → `GET /v1/videos/{id}` → `/content`） |
| `check_video` | 按任务 id 查询视频任务状态 | `GET /v1/videos/{id}` |
| `speech_synthesize` | 文转语音，产物存工作区 | `POST /v1/audio/speech` |
| `speech_transcribe` | 音视频文件转写为文本 | `POST /v1/audio/transcriptions`（multipart） |
| `generate_music` | Suno 音乐生成→下载→存工作区 | `POST /suno/submit/{MUSIC\|LYRICS}` → `GET /suno/fetch/{id}` |

## 配置（设置 > 插件 > Mino 媒体生成）

- `videoModel` / `ttsModel` / `ttsVoice` / `sttModel` / `musicModel`：填 Mino 后台开通的模型 id，未配则工具报错提示
- `workspaceFolder`：产物落盘目录（默认 `mino-media/`）
- `taskTimeoutMs`：异步任务最长等待（默认 15 分钟）

## 依赖

必须先启用 `mino-inference`（提供网关端点与账号凭据）；本包不含任何 URL 与密钥。

⚠ 生产可用性以网关实际开通的通道为准；模型 id 未在后台配置时对应工具不可用。
