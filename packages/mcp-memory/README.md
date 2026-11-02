# mino-mcp-memory

把官方 **memory 知识图谱 MCP 服务器**（`@modelcontextprotocol/server-memory`）接进
harness：模型获得 `mcp__memory__*` 系列工具（实体/关系/观察的建查改删）。

## 形态

纯配置 bundle：安装即通过 `cordis.patch.yml` 插入一条官方
`@deepseek-ai/dsh-mcp-client` 配置行；卸载本包即移除该服务器，零残留。

## 前置条件

- 本机有 `node`/`npm`（`npx` 首次运行会下载服务器包，此后走缓存）。
- 无需密钥。

## 使用

安装后新会话里直接让模型"记住 x / 回忆 y"，或 `/` 无效时确认
`mcp__memory__*` 工具是否出现在工具表。记忆文件默认写在服务器进程工作目录；
要固定位置可在 profile patch 里给该行补 `env.MEMORY_FILE_PATH`。

## 自定义

本行 id 为 `mcp-memory`：在 profile `cordis.patch.yml` 里按 id 覆盖整个
`config` 字段即可调超时、换 transport 或改 args（patch 整段替换，需写全）。
