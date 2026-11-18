# mino-connector-notion

Notion 连接器——走官方 REST API（`Notion-Version: 2022-06-28`）。

## 工具

- `notion_search {q?, limit?}` — 搜工作区页面/库，返回 id/标题/链接/最近编辑
- `notion_page {id}` — 按 id 取页面摘要

## 凭据（官方 credentials 缝）

integration token 不落配置文件：

```
cred_set NOTION_TOKEN=ntn_xxx
```

或改引用名：在 `~/.dsh/connector-notion.json` 填 `{"tokenRef":"MY_REF"}`。
明文 `{"token":"ntn_..."}` 为回退路径。`baseUrl` 字段可覆盖（测试夹具用）。
