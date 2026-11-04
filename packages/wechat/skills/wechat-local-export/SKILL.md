---
name: wechat-local-export
description: 微信本地库解密导出。wechat_dirs 侦察数据目录→配导出引擎（wechat-dump-rs/PyWxDump 到 connector-wechat.json 的 dumper）→wechat_decrypt 解密入聊天库。
---
# 微信本地库解密导出

wechat_dirs 侦察数据目录→配导出引擎（wechat-dump-rs/PyWxDump 到 connector-wechat.json 的 dumper）→wechat_decrypt 解密入聊天库。

## 边界

- 只读本机自己的数据，数据不出本机
- 取钥/解密由用户配置的开源引擎完成，本体不含密钥提取逻辑
- 微信/QQ 须运行且已登录（取钥依赖进程内存）
- 加密域打不开时给白话指引，不硬解
