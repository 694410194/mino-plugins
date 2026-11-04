# mino-connector-wechat

微信本地库解密导出连接器。

wechat_dirs 侦察数据目录→配导出引擎（wechat-dump-rs/PyWxDump 到 connector-wechat.json 的 dumper）→wechat_decrypt 解密入聊天库。

## 原则

- 特区深侧：只读你自己设备上你自己的数据
- 引擎由用户配置，本体不含取钥逻辑
