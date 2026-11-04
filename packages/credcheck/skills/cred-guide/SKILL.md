---
name: cred-guide
description: 凭据门源怎么配/怎么验：cloud/mail/music 的凭据文件格式、cred_status 盘点、cred_check 真凭据实测排错。
---

# 凭据自检

凭据门源（需要用户自己账号的）配错了用户只会看到一堆失败——先用本件验一遍。

## 凭据文件（都在 `~/.dsh/`）

- `connector-cloud.json`：`wereadCookie`（微信读书）/ `biliCookie`（B站 SESSDATA）/
  `weiboCookie` / `netdiskCookie` / `immich{url,key}` / `homeassistant{url,token}` /
  `doubanUid` / `caldav{url,user,pass}`
- `connector-mail.json`：`{"host":"imap.qq.com","port":993,"user":"邮箱","pass":"授权码","tls":true}`
  ——QQ/163/Gmail 都要在网页邮箱设置开 IMAP 拿**授权码**，不是登录密码
- `connector-music.json`：`{"neteaseCookie":"MUSIC_U=...","uid":"数字"}`

## 流程

1. `cred_status` 盘点：哪些配了哪些没配（掩码，不联网）
2. `cred_check` 实测：每个源真发一次请求——✅ 有效 / ❌ 失效+白话原因
3. ❌ 的处理：cookie 过期→让用户去对应网站重新抓；mail 登录被拒→提醒用授权码

## 口径

- 凭据只进对应源的请求头，不落地、不上传第三方
- 用户没配的源直接报「未配+怎么配」，别拿空凭据硬调接口
