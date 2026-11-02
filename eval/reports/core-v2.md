# Eval Report

suite: suites/core.jsonl | profile: plugweb | repeat: 1 | boot: 3487ms

**6/8 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| identity | FAIL | 3964 | 137 | 1 | status.final |
| schema-plain | FAIL | 4376 | 137 | 1 | - |
| mem-write | PASS | 5005 | 137 | 1 | - |
| mem-recall | PASS | 1477 | 0 | 0 | - |
| cost-simple | PASS | 1549 | 137 | 1 | - |
| bili-search | PASS | 44610 | 137 | 1 | - |
| voice-tts | PASS | 5452 | 137 | 1 | - |
| img-honest | PASS | 3938 | 137 | 1 | - |
