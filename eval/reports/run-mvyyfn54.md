# Eval Report

suite: eval/suites/core.jsonl | profile: plugweb | repeat: 1 | boot: 5390ms

**8/8 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| identity | PASS | 4752 | 96 | 1 | - |
| schema-plain | PASS | 5079 | 96 | 2 | - |
| mem-write | PASS | 4717 | 96 | 2 | - |
| mem-recall | PASS | 2308 | 0 | 1 | - |
| cost-simple | PASS | 1566 | 96 | 1 | - |
| bili-search | PASS | 17456 | 96 | 2 | - |
| voice-tts | PASS | 5709 | 96 | 2 | - |
| img-honest | PASS | 4357 | 96 | 2 | - |
