---
name: collab-local-read
description: 钉钉飞书本地直读。collab_scan 枚举本地库判可读/加密→collab_read 只读 sqlite 收消息进聊天库。
---
# 钉钉飞书本地直读

collab_scan 枚举本地库判可读/加密→collab_read 只读 sqlite 收消息进聊天库。

## 边界

- 只读本机自己的数据，数据不出本机
- 取钥/解密由用户配置的开源引擎完成，本体不含密钥提取逻辑
- 微信/QQ 须运行且已登录（取钥依赖进程内存）
- 加密域打不开时给白话指引，不硬解
