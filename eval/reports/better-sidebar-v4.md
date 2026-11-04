# Eval Report

suite: eval/suites/better-sidebar.jsonl | profile: plugweb | repeat: 1 | boot: 5481ms

**4/5 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| bs-warmup | PASS | - | - | - | - |
| bs-api-unauth | PASS | - | - | - | - |
| bs-api-authed | PASS | - | - | - | - |
| bs-schema | PASS | 623 | 105 | 1 | - |
| bs-open-tool | FAIL | 496 | 105 | 1 | tools.called |
