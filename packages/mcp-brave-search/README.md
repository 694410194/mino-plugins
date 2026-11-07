# @modelcontextprotocol/server-brave-search

接入 **Brave Search MCP 服务器**（`@modelcontextprotocol/server-brave-search`）：
模型获得 `mcp__brave__brave_web_search` 等搜索工具，可作为内置 web 搜索之外的
第二搜索源。

## 形态

纯配置 bundle：安装即通过 `cordis.patch.yml` 插入一条官方
`@deepseek-ai/dsh-mcp-client` 配置行；卸载本包即移除该服务器，零残留。

## 前置条件

- 本机有 `node`/`npm`。
- **`BRAVE_API_KEY` 环境变量**（Brave Search API 免费档可申请）。
- 未设置时该行通过 `disabled: !!js` 自动停用，设好后重载/重启即生效。

## 注意

上游服务器包已归档停更（0.6.2 为最终版），功能正常但不再演进；
需要长期维护的搜索通道建议改用自部署 SearXNG + streamable-http 行。

## 自定义

本行 id 为 `mcp-brave-search`：在 profile `cordis.patch.yml` 里按 id 覆盖
整个 `config` 字段（如换搜索端点或改超时）。
