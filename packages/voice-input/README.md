# mino-voice-input

纯配置 bundle：把官方 experimental **voice input** 四件套挂进 profile，零自有代码。

| 行 | 官方包 | 提供 |
|---|---|---|
| `speech-to-text` | `dsh-experimental-speech-to-text` | STT 服务门面 |
| `speech-to-text-sensevoice` | `dsh-experimental-speech-to-text-sensevoice` | 本地 SenseVoice ASR（模型/运行时首次按需下载，离线、免 key） |
| `api-speech-to-text` | `dsh-experimental-api-speech-to-text` | Remote API 面 |
| `ui-voice-input` | `dsh-experimental-client-ui-voice-input` | 输入栏语音输入 UI |

与 `dsh-voice`（TTS 朗读 + 可选云端 ASR）不冲突：本包是**按住说话/听写**的输入方向，
dsh-voice 是朗读输出方向。

## 注意

- experimental 包；首次使用会下载 SenseVoice 运行时与模型（需网络）。
- 全双工对话（barge-in 打断、连续语音通话）看 `dsh-voice-mode`。
