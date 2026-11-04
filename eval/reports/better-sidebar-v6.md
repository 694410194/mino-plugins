# Eval Report

suite: eval/suites/better-sidebar.jsonl | profile: plugweb | repeat: 1 | boot: 5396ms

**5/5 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| bs-warmup | PASS | - | - | - | - |
| bs-api-unauth | PASS | - | - | - | - |
| bs-api-authed | PASS | - | - | - | - |
| bs-schema | PASS | 2909 | 105 | 1 | - |
| bs-open-tool | PASS | 2980 | 105 | 2 | - |
