# Eval Report

suite: eval/suites/better-sidebar.jsonl | profile: plugweb | repeat: 1 | boot: 5006ms

**3/4 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| bs-api-unauth | PASS | - | - | - | - |
| bs-api-authed | PASS | - | - | - | - |
| bs-schema | PASS | 726 | 105 | 1 | - |
| bs-open-tool | FAIL | 493 | 105 | 1 | tools.called |
