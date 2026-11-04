---
name: schedule-overview
description: 日程总览。用 cal_upcoming 看未来 N 天日程，cal_import 导 ics，cal_sync 从 CalDAV 拉。
---
# 日程总览

## 用法

ics 文件用 cal_import；CalDAV 凭据在 connector-cloud.json 的 caldav 段。

## 边界

只读拉取不回写；iCloud 用应用专用密码。
