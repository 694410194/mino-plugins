---
name: semantic-search
description: 「懂意思」的语料搜索用法：corpus_search 是关键词命中，sem_search 是懂意思——「上次说的餐厅」「聊过装修的事」这种摸不着的问法用它。
---

# 语义检索层

`corpus_search` 按关键词字面命中；`sem_search` 把语料编成向量索引，按意思找——
用户问法摸不到原词时（「上次说的那个」「聊过 XX 的事」「类似之前那个」）用它。

## 流程

1. `sem_setup` 就绪引擎（本地 llama-server 跑中文 embedding，语料不出本机；
   用户在 `connector-semsearch.json` 配了 endpoint 就走他的端点）
2. `sem_index` 把全部连接器语料编进向量索引（增量去重，语料大就分批续跑）
3. `sem_search` 查：自然语言问句直接给

## 口径

- 引擎（llama-server）+模型（bge 中文 embedding GGUF）是按需下载的第三方件，
  语料在本机向量化，不上传任何原文
- 自配 endpoint 的例外：语料会发给用户自己选的端点，配置时向用户说明
- 索引大文件可能几分钟到几小时，`sem_index` 可反复调续跑（hash 去重不重复入库）
