# mino-voice-notes

「语音笔记」面板：录音 → 分段 → 本机转写 → 纪要 → 本地分享页。

## 能力面

- 侧栏面板（`vnotes`）：录音控制 + 笔记列表 + 详情（转写/纪要/分段回放/分享）
- 6 个模型工具：`vnote_start` / `vnote_stop` / `vnote_list` / `vnote_get` / `vnote_update` / `vnote_share`
- 自有路由：`/mino-voice-notes/api/{start,segment,stop,list,note,update,share,delete,audio}` + `/mino-voice-notes/s/<shareId>` 只读分享页
- 服务缝：`ctx.get('mino-voice-notes')` → `{start,stop,status}`（meeting-detect 等消费方走这里，不走工具名）

## 解耦边界

| 环节 | 缝 |
|---|---|
| 采集 | 自有 client 半：`getUserMedia` → AudioContext 16kHz mono → PCM16 → WAV（官方 voice-input 同款路径）→ `api/segment` 每 15s 分段上传 |
| 转写 | `ctx.speechToText.resolve+transcribe`（provider 由 voice-input bundle 内置的 `sensevoice-local` 提供；没装时笔记落 `failed` 并写明原因） |
| 纪要 | 模型读 `vnote_get` 转写文 → `vnote_update` 写回 `summary` → 可 `today_post` 投 feed（软依赖） |
| 存储 | 自有 `~/.mino/mino-voice-notes/`：`notes.json` 索引 + `audio/<id>/seg-*.wav` |

## Known Limitations

- 分享页在 web 档鉴权域内（同源 token），不是公网链接。
- ScriptProcessorNode 采集（非 AudioWorklet）：主线程繁忙时理论上可能丢帧；官方 voice-input 用 Worklet，后续可对齐。
- 说话人分离 deferred（需要 pyannote 类外部管线）。
- `stop` 后台转写：长录音通过 `vnote_get` 轮询拿结果（TRANSCRIBE_TIMEOUT 120s/段批量）。
