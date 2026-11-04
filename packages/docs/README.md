# mino-connector-docs

文档内容检索连接器。

docs_index 给目录建全文索引（含 docx/pptx/xlsx 解正文），docs_search 按关键词查正文。

## 原则

- 只读/本地：数据不出本机
- 用户主动：导入动作都由用户发起
- 本地索引，文件不出本机；大文件（>5MB）跳过。
