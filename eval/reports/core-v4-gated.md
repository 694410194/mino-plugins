# Eval Report

suite: suites/core.jsonl | profile: plugweb | repeat: 1 | boot: 3602ms

**6/8 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| identity | PASS | 3766 | 86 | 1 | - |
| schema-plain | PASS | 1840 | 86 | 1 | - |
| mem-write | PASS | 6267 | 86 | 2 | - |
| mem-recall | PASS | 2271 | 0 | 1 | - |
| cost-simple | PASS | 2082 | 86 | 1 | - |
| bili-search | FAIL | 47626 | 86 | 10 | modelCalls.max |
| voice-tts | PASS | 4409 | 86 | 2 | - |
| img-honest | FAIL | 4259 | 86 | 2 | reply.match |
