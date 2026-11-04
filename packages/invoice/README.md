# mino-connector-invoice

发票连接器（conn-finance 域）。

## 工具
- `invoice_scan`：扫文件夹里 .ofd/.pdf 发票 → 号码/日期/销售方/金额 → `~/.dsh/connector-invoice/invoices.csv`

OFD 用系统解压读内嵌 XML（全量字段）；PDF 做启发式提取（压缩流会退化，建议优先收 OFD 版）。只读、本地。

## 许可
MIT。