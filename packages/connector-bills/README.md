# mino-connector-bills

跨生态消费账单连接器。读**你自己**从支付宝/微信官方导出的账单文件，
本地转成统一账目（beancount）并产出分类/月度汇总，喂给年度报告 skill。

## 原则

- **只读**：不碰数据源本体，产物写新文件。
- **本地**：全部解析在本机完成，账单内容不进入任何网络请求；
  模型只看到汇总数字与你让它看的片段。
- **用户主动**：文件路径你给，插件不扫盘找文件。

## 用法

装好后直接对 Mino 说：「帮我把这份账单理一理：D:\下载\alipay_record_2024.csv」，
或「把今年的支付宝和微信账单做成年度报告」。

工具 `bills_import`：

| 参数 | 说明 |
|---|---|
| `path` | 账单导出文件绝对路径（.csv/.xlsx/.zip） |
| `provider` | `alipay` / `wechat` / `auto`（默认自动识别文件头） |
| `rules` | 可选：自定义分类规则 YAML 路径 |

产物写在源文件旁边：`<文件名>.beancount`（全量账目）+ `<文件名>.summary.md`（汇总）。

## 导出指引

- **支付宝**：我的→账单→右上角…→开具交易流水证明→用于个人对账→选时间范围→发送到邮箱。
  下载得到的 zip 请先解压（带密码的压缩包插件解不开），把 csv 路径给 Mino。
- **微信**：我→服务→钱包→账单→右上角常见问题→下载账单→用于个人对账→选时间→填邮箱。
  解压码在微信支付公众号消息里；同样请先解压再给 csv。

## 平台

当前仅 Windows（vendored `double-entry-generator` CLI 为 win32 二进制），
其它平台上插件照常装载但工具不注册。

## 上游

- [double-entry-generator](https://github.com/deb-sig/double-entry-generator) v2.16.0（Apache-2.0，见 `vendor/deg-LICENSE.txt`）。
