# Eval Report

suite: suites/core.jsonl | profile: plugweb | repeat: 1 | boot: 3595ms

**7/8 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| identity | PASS | 3628 | 137 | 1 | - |
| schema-plain | FAIL | 5094 | 137 | 1 | schema.absent; schema.absent; schema.absent; schema.absent; schema.absent; schema.absent |
| mem-write | PASS | 5712 | 137 | 1 | - |
| mem-recall | PASS | 2161 | 0 | 0 | - |
| cost-simple | PASS | 2328 | 137 | 1 | - |
| bili-search | PASS | 46252 | 137 | 1 | - |
| voice-tts | PASS | 4950 | 137 | 1 | - |
| img-honest | PASS | 4188 | 137 | 1 | - |
