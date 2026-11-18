# mino-connector-qqmeeting

腾讯会议连接器——企业自建应用（AKSK），签名按官方 TC3-HMAC-SHA256。

## 工具

- `mtg_list {userid, instanceid?, page?, page_size?}` — 列用户会议
- `mtg_get {meetingId, userid}` — 取会议详情

## 鉴权

签名串：`METHOD\n` + `X-TC-Key/Nonce/Timestamp`（字典序）+ `\nURI\n` + Body；
`X-TC-Signature = base64(hex(HMAC-SHA256(SecretKey, stringToSign)))`。

非密配置 `~/.dsh/connector-qqmeeting.json`：`{"appId":"...","sdkId":"...","baseUrl":"..."}`

密钥对走官方凭据库（不落文件）：

```
cred_set TXMEET_SECRET_ID=<SecretId>
cred_set TXMEET_SECRET_KEY=<SecretKey>
```

明文 `secretId`/`secretKey` 字段为回退。
