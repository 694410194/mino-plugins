# mino-connector-files-search

文件检索连接器。按文件名在本机找文件。

## 引擎

- 装了 [Everything](https://www.voidtools.com/)：走它的全盘文件名索引，毫秒级全盘搜索（es.exe 调用，不重分发——装了就吃现成）
- 没装：PowerShell 扫 桌面/下载/文档/图片/视频 常用目录，或用 `root` 指定目录

## 原则

只读、本地、用户主动：只按文件名匹配不读内容，结果不出本机。

## 工具

`files_search`：`q` 文件名关键词、`root` 可选搜索目录、`limit` 条数。
