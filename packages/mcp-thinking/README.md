# mino-mcp-thinking

接入官方 **sequential-thinking MCP 服务器**
（`@modelcontextprotocol/server-sequential-thinking`）：模型获得
`mcp__thinking__sequentialthinking` 工具，可把复杂任务拆成可修订、可分支的
显式思考步骤。

## 形态

纯配置 bundle：安装即通过 `cordis.patch.yml` 插入一条官方
`@deepseek-ai/dsh-mcp-client` 配置行；卸载本包即移除该服务器，零残留。

## 前置条件

- 本机有 `node`/`npm`（`npx` 首次运行会下载服务器包）。
- 无需密钥。

## 自定义

本行 id 为 `mcp-thinking`：在 profile `cordis.patch.yml` 里按 id 覆盖整个
`config` 字段即可调超时或改 args（patch 整段替换，需写全）。
