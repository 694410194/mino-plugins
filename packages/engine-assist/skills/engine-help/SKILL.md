---
name: engine-help
description: 引擎代办用法：连接器说缺引擎、或用户说「帮我装」时——engine_status 看缺啥、engine_setup 自动装、engine_register 登记手动装的。
---

# 引擎代办

连接器用到的第三方工具（引擎）统一由 `mino-connector-engine-assist` 管安装。

## 什么时候用

- 连接器报错里带「没装 / 未探测到 / engine」字样
- 用户说「帮我装」「你帮我弄一下」

## 流程

1. `engine_status` 看缺什么、已有什么
2. `engine_setup` 直接装（Windows 自动下载官方 release 到 `~/.dsh/engines/`）
3. 用户自己已经下载好的，`engine_register` 登记路径——登记后所有连接器都认到

## 口径

- 引擎是用户机器上、用户点头安装的第三方工具；本体不捆绑任何破解/解密能力
- 微信/QQ 解密引擎（wechat-dump / qq-exporter）不自动下载：仓随时被函蒸发，
  让用户自己找活跃 fork 下载后 `engine_register`
- 下载失败=网络不通：报白话原因+手动安装路径，不装死
