# mino-connector-webwatch

被动观察 v0：反爬死域（12306/滴滴/淘宝订单）的入口=用户浏览器历史。

- `watch_scan`：扫浏览器历史里访问过的订单/行程页，每个命中给导入通道
- `watch_suggest`：单站点的可用导入通道（复制文本→orders/travel、截图→ocr、官方导出→bills）

只读本机历史库快照，不监听不驻留不上传；导入动作由用户发起。
