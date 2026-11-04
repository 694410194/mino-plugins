# Eval Report

suite: eval/suites/better-sidebar.jsonl | profile: plugweb | repeat: 1 | boot: 5383ms

**2/4 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| bs-schema | FAIL | 1525 | 104 | 1 | schema.present |
| bs-api-unauth | PASS | - | - | - | - |
| bs-api-authed | PASS | - | - | - | - |
| bs-open-tool | FAIL | 506 | 105 | 1 | tools.called |
