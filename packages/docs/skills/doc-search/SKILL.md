---
name: doc-search
description: 文档内容检索。docs_index 给目录建全文索引（含 docx/pptx/xlsx 解正文），docs_search 按关键词查正文。
---
# 文档内容检索

## 用法

先 docs_index 建索引再 docs_search；office 文件走 PowerShell 解压取 XML。

## 边界

本地索引，文件不出本机；大文件（>5MB）跳过。
