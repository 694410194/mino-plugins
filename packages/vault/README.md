# mino-connector-vault

密码库速查连接器。

vault_import 导入 Bitwarden/KeePass/浏览器 明文 CSV 导出；vault_search 查条目。

## 原则

- 只读/本地：数据不出本机
- 用户主动：导入动作都由用户发起
- 敏感源：导入后建议删掉明文导出文件；数据不出本机。
