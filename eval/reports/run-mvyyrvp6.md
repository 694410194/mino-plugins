# Eval Report

suite: eval/suites/new13.jsonl | profile: plugweb | repeat: 1 | boot: 4915ms

**6/8 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| skillhub-list | PASS | 6410 | 125 | 2 | - |
| drawio-template | FAIL | 47302 | 125 | 11 | modelCalls.max |
| notes-export | PASS | 8315 | 125 | 2 | - |
| ops-discover | FAIL | 43570 | 132 | 16 | modelCalls.max |
| damage-balance | PASS | 6277 | 125 | 2 | - |
| taskboard-list | PASS | 3535 | 125 | 2 | - |
| visualize-call | PASS | 16276 | 125 | 4 | - |
| import-schema | PASS | 3865 | 125 | 1 | - |
