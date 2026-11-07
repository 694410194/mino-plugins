# mino-connector-cloud

云端账号连接器（凭据门形态，一个包覆盖六个源：微信读书划线/B站收藏/微博/百度网盘/immich 相册/Home Assistant）。

## 工具
- `cloud_status`：查哪些源配好了、缺什么
- `cloud_pull`：从指定源拉摘要（weread 书单/bili 收藏夹/网盘用量/immich 相册/HA 实体统计）

## 凭据
`~/.mino/connector-cloud.json`：
```json
{"wereadCookie":"...", "biliCookie":"SESSDATA=...", "weiboCookie":"...",
 "netdiskCookie":"...", "immich":{"url":"http://:2283","key":"..."},
 "homeassistant":{"url":"http://:8123","token":"..."}}
```
凭据只进对应服务请求头，不出本机。

## 许可
MIT。