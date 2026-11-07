# mino-inference

Mino 推理服务层：媒体生成类插件与网关之间唯一的耦合点。

- 端点归一：`baseURL` 走插件 Config（默认 `https://api.mino.baby/v1`，部署可改），代码内无 URL
- 凭据归一：grant token 经 `deepseekAccount.resolveToken(baseURL)` 解析，401 自动作废
- 请求归一：`post` / `postJson` / `getJson` / `download` / `poll`（任务轮询）
- 生命周期归一：`ctx.provide('minoInference', …)`，随插件卸载原子消失

消费方式：`ctx.get('minoInference')`（消费插件把 `minoInference` 加进 inject 或调用时取）。

| 方法 | 用途 |
|---|---|
| `endpoint(path)` | 裸路径拼到 `…/v1`；`/` 开头拼到 origin（如 `/suno/*`） |
| `resolveAuth()` | 解析 grant token → `{token, headers}` |
| `post(path, {body\|form, signal})` | 带鉴权 POST，非 2xx 抛 `HttpStatusError` |
| `postJson` / `getJson` | JSON 收发 |
| `poll(path, {isDone, intervalMs, timeoutMs})` | 异步任务轮询直到完成/失败/超时 |
| `download(url, {maxBytes})` | 结果文件下载：同源先带 grant、被拒降级无凭据；外链直连（带字节上限） |
| `readBytes(response, maxBytes)` | 有界读取二进制响应体（TTS 等流式产物） |

消费插件：dsh-image-gen、mino-media。
