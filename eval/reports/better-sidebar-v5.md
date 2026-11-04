# Eval Report

suite: eval/suites/better-sidebar.jsonl | profile: plugweb | repeat: 1 | boot: 6133ms

**5/5 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| bs-warmup | PASS | - | - | - | - |
| bs-api-unauth | PASS | - | - | - | - |
| bs-api-authed | PASS | - | - | - | - |
| bs-schema | PASS | 3077 | 105 | 1 | - |
| bs-open-tool | PASS | 3201 | 105 | 2 | - |
