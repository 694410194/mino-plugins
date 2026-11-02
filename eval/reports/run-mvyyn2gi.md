# Eval Report

suite: eval/suites/core.jsonl | profile: plugweb | repeat: 1 | boot: 5098ms

**8/8 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| identity | PASS | 5085 | 115 | 1 | - |
| schema-plain | PASS | 5510 | 115 | 2 | - |
| mem-write | PASS | 5144 | 115 | 2 | - |
| mem-recall | PASS | 3130 | 0 | 1 | - |
| cost-simple | PASS | 2057 | 115 | 1 | - |
| bili-search | PASS | 14329 | 115 | 2 | - |
| voice-tts | PASS | 6465 | 115 | 2 | - |
| img-honest | PASS | 4142 | 115 | 2 | - |
