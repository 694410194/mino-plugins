# mino-connector-mail

邮件连接器（conn-mail 域）。

## 工具
- `mail_recent`：最近 N 封邮件（主题/发件人/日期）
- `mail_search`：按关键词搜邮件

## 凭据
`~/.dsh/connector-mail.json`：`{"host":"imap.qq.com","port":993,"user":"...","pass":"授权码","tls":true}`
QQ/163/Gmail 都在网页版邮箱设置里开 IMAP 生成授权码（不是登录密码）。

## 许可
MIT。