# mino-connector-asr

语音转写连接器。

asr_status 查引擎，asr_transcribe 把录音转文字（whisper.cpp/faster-whisper）。

## 原则

- 只读/本地：数据不出本机
- 用户主动：导入动作都由用户发起
- 可选重型件：模型几百 MB 需用户自下载；全程本地推理。
