# Eval Report

suite: eval/suites/e2e-prod.jsonl | profile: plugweb | repeat: 1 | boot: 4738ms

**2/3 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| prod-init | FAIL | 142113 | 126 | 13 | reply.match |
| prod-ep1-script | PASS | 57980 | 0 | 12 | - |
| prod-ep1-blueprint | PASS | 252802 | 0 | 23 | - |
