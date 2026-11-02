# Eval Report

suite: suites/core.jsonl | profile: plugweb | repeat: 3 | boot: 3696ms

**5/8 probes pass-all** (2 flaky: schema-plain,mem-write)

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| identity | PASS | 2950 | 137 | 1 | - |
| schema-plain | FLAKY | 3031 | 137 | 1 | schema.absent; schema.absent; schema.absent; schema.absent; schema.absent; schema.absent |
| mem-write | FLAKY | 5087 | 137 | 1 | tools.called; tools.called |
| mem-recall | PASS | 2813 | 0 | 0 | - |
| cost-simple | PASS | 2199 | 137 | 1 | - |
| bili-search | PASS | 10641 | 137 | 1 | - |
| voice-tts | PASS | 5492 | 137 | 1 | - |
| img-honest | FAIL | 11536 | 137 | 1 | reply.match; reply.match; reply.match |
