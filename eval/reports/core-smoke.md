# Eval Report

suite: suites/core.jsonl | profile: plugweb | repeat: 1 | boot: 3380ms

**4/8 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| identity | FAIL | 2661 | 137 | 1 | status.final |
| schema-plain | FAIL | 4580 | 137 | 1 | - |
| mem-write | PASS | 5766 | 137 | 1 | - |
| mem-recall | FAIL | 38 | 0 | 0 | reply.match |
| cost-simple | PASS | 1860 | 137 | 1 | - |
| bili-search | PASS | 37889 | 137 | 1 | - |
| voice-tts | PASS | 5295 | 137 | 1 | - |
| img-honest | FAIL | 3920 | 137 | 1 | reply.match |
