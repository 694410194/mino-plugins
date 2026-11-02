# mino-mcp-github

接入 **GitHub 官方远端 MCP 服务器**（`https://api.githubcopilot.com/mcp/`，
Streamable HTTP）：模型获得 `mcp__github__*` 工具，覆盖仓库/issue/PR/代码搜索等
GitHub 操作，无需本机跑任何进程。

## 形态

纯配置 bundle：安装即通过 `cordis.patch.yml` 插入一条官方
`@deepseek-ai/dsh-mcp-client` 配置行；卸载本包即移除该服务器，零残留。

## 前置条件

- **`GITHUB_TOKEN` 环境变量**（GitHub PAT，按你需要的 repo 范围授权）。
- 未设置时该行通过 `disabled: !!js` 自动停用——装了不占位、不报错，
  设好环境变量后重载配置或重启即生效。
- 远端服务器在境外，需网络可达 `api.githubcopilot.com`。

## 自定义

本行 id 为 `mcp-github`：在 profile `cordis.patch.yml` 里按 id 覆盖整个
`config` 字段（如改用只读模式、自部署端点或 GitHub Enterprise 地址）。
