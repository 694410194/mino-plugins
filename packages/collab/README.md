# mino-connector-collab

钉钉飞书本地直读连接器。

collab_scan 枚举本地库判可读/加密→collab_read 只读 sqlite 收消息进聊天库。

## 原则

- 特区深侧：只读你自己设备上你自己的数据
- 引擎由用户配置，本体不含取钥逻辑
