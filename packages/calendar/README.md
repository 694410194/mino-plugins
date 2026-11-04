# mino-connector-calendar

日程总览连接器。

用 cal_upcoming 看未来 N 天日程，cal_import 导 ics，cal_sync 从 CalDAV 拉。

## 原则

- 只读/本地：数据不出本机
- 用户主动：导入动作都由用户发起
- 只读拉取不回写；iCloud 用应用专用密码。
