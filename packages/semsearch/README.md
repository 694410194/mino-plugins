# mino-connector-semsearch

语义检索层：把全部连接器语料编成向量索引，corpus 的关键词检索升级成「懂意思」的搜索。

- `sem_setup`：探测/下载 llama-server + 中文 embedding 模型（bge GGUF），起本地服务；也可在 `~/.dsh/connector-semsearch.json` 配 `endpoint/key/model` 走用户自己的 OpenAI 兼容端点
- `sem_index`：扫 `~/.dsh/connector-*/*.db` 增量编索引（sha1 去重、int8 量化、纯 JS 余弦，零原生依赖）
- `sem_search`：自然语言查询 → topK 原文+来源
- `sem_status`：索引量/引擎/模型状态

默认路径语料不出本机（本地 llama-server 向量化）；自配端点会按用户选择发出原文。
