---
name: qq-local-export
description: QQ本地库解密导出。qq_dirs 侦察 nt_db→配导出引擎（connector-qq.json 的 exporter+exporterArgs）→qq_decrypt 收编。
---
# QQ本地库解密导出

qq_dirs 侦察 nt_db→配导出引擎（connector-qq.json 的 exporter+exporterArgs）→qq_decrypt 收编。

## 边界

- 只读本机自己的数据，数据不出本机
- 取钥/解密由用户配置的开源引擎完成，本体不含密钥提取逻辑
- 微信/QQ 须运行且已登录（取钥依赖进程内存）
- 加密域打不开时给白话指引，不硬解
