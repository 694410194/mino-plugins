# mino-connector-chat-export

聊天记录连接器（conn-im 域，特区·洛雪壳形态）。

**本体零解密**：不碰微信/QQ 数据库和密钥。只读用户自己用导出工具（WeChatMsg/留痕/PyWxDump/QQExporter 等）产出的明文文件。

## 工具
- `chat_import`：把 .txt/.csv/.json/.jsonl/.html 导出文件/目录导进本地 sqlite
- `chat_search`：关键词检索已导入记录

数据不出本机；解密导出是用户侧工具的事，本插件不代收。

## 许可
MIT。