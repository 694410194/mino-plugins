# mino-connector-backup

手机备份盘点连接器。

backup_dirs 枚举 iTunes/HiSuite/小米备份目录；backup_itunes 读 Manifest.db 看备份内容按域统计。

## 原则

- 只读/本地：数据不出本机
- 用户主动：导入动作都由用户发起
- 只读 Manifest.db 不解密内容。
