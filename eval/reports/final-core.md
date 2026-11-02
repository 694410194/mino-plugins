# Eval Report

suite: suites/core.jsonl | profile: plugweb | repeat: 1 | boot: 3622ms

**6/8 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| identity | PASS | 3631 | 137 | 1 | - |
| schema-plain | FAIL | 5077 | 137 | 2 | schema.absent; schema.absent; schema.absent; schema.absent; schema.absent; schema.absent |
| mem-write | PASS | 5739 | 137 | 2 | - |
| mem-recall | PASS | 2437 | 0 | 1 | - |
| cost-simple | PASS | 2570 | 137 | 1 | - |
| bili-search | PASS | 13261 | 137 | 2 | - |
| voice-tts | PASS | 4458 | 137 | 2 | - |
| img-honest | FAIL | 39803 | 137 | 10 | reply.match; modelCalls.max |
