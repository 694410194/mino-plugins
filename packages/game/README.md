# mino-connector-game

游戏数据连接器（目录外域：游戏，对标 PDH 原神/王者 adapter）。

## 工具
- `gacha_import`：粘贴游戏抽卡历史页 URL（含 authkey）→ 拉全量祈愿记录，汇总各池抽数/五星/保底进度，存档 `~/.dsh/connector-game/`
- `gacha_summary`：看最近一次导入的汇总

URL 获取：游戏里抽卡页 → 历史记录 → 复制地址栏链接。authkey 约一天过期。

## 许可
MIT。