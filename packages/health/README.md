# mino-connector-health

健康数据连接器（conn-health 域）。

## 工具
- `health_summary`：传 export.xml 路径 → 按类型统计（步数/距离/心率/体重/睡眠/能量），可限最近 N 天

iPhone 导出法：健康 App → 头像 → 导出所有健康数据 → 解压 ZIP 得 export.xml。
流式逐行解析，几个 GB 也跑得动；只读、本地。

## 许可
MIT。