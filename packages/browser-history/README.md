# mino-connector-browser-history

浏览器历史连接器。只读本机 Chrome / Edge / Firefox / Brave 的浏览记录，
帮 Mino 回答「我之前看过那个网页叫什么」「我最近在关注什么」。

## 原则

- **只读**：复制库文件快照后只读查询，绝不写回浏览器数据。
- **本地**：全部查询在本机完成，历史内容不进任何网络请求。
- **用户主动**：默认只查本机标准位置；也可以用 `path` 参数指定你自己的库文件。

## 工具

| 工具 | 说明 |
|---|---|
| `browser_history_recent` | 最近看过的页面（标题/网址/时间），支持 `days` 天数、`q` 关键词、`browser` 指定浏览器 |
| `browser_history_top` | 常去站点统计（按访问次数），支持 `days` 范围 |

## 覆盖

- Chromium 系（Chrome / Edge / Brave）：`User Data/<Profile>/History`
- Firefox：`Profiles/*/places.sqlite`
- 其它浏览器：用 `path` 参数指定同格式库文件

需要运行环境提供 `node:sqlite`（Node ≥22.13，Mino 自带运行时已满足）；
不满足时工具不注册，插件照常装载。
