# Eval Report

suite: eval/suites/better-sidebar.jsonl | profile: plugweb | repeat: 1 | boot: 7508ms

**2/4 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| bs-schema | FAIL | 1562 | 104 | 1 | schema.present |
| bs-api-unauth | PASS | - | - | - | - |
| bs-api-authed | PASS | - | - | - | - |
| bs-open-tool | FAIL | 497 | 104 | 1 | tools.called |
