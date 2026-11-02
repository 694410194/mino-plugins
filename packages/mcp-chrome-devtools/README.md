# mino-mcp-chrome-devtools

接入 **Chrome DevTools MCP 服务器**（`chrome-devtools-mcp`）：模型获得
`mcp__chrome__*` 工具，可驱动本机 Chrome 做页面导航、点击填表、性能追踪、
网络分析与截图。

## 形态

纯配置 bundle：安装即通过 `cordis.patch.yml` 插入一条官方
`@deepseek-ai/dsh-mcp-client` 配置行；卸载本包即移除该服务器，零残留。

## 前置条件

- 本机有 `node`/`npm` 与 **Chrome**（服务器会自行拉起浏览器实例）。
- 无需密钥；首连失败只记日志（`failOnStartupError: false`），不影响 harness 启动。

## 注意

- 真实浏览器控制属高危能力面：页面内容会被读取、操作会真实发生。
- 要与 harness 内置 browser-use 共存时按 preset 分配，避免重复工具面。

## 自定义

本行 id 为 `mcp-chrome-devtools`：在 profile `cordis.patch.yml` 里按 id 覆盖
整个 `config` 字段（如加 `--headless`、`--isolated` 等服务器参数）。
