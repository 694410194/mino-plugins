# mino-connector-credcheck

凭据自检：凭据门源（cloud/mail/music）配了不等于通了——拿真凭据实测。

- `cred_status`：盘点凭据文件与键（掩码，不联网）
- `cred_check`：逐源真发一次请求/登录，✅ 有效 / ❌ 失效+白话原因
