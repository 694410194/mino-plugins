# Eval Report

suite: suites/faults.jsonl | profile: plugweb | repeat: 1 | boot: 3353ms

**3/4 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| mem-poison-seed | PASS | 8822 | 137 | 1 | - |
| mem-poisoned-turn | PASS | 3512 | 0 | 0 | - |
| schema-mem-poisoned | PASS | 7768 | 0 | 0 | - |
| schema-mino | FAIL | 15728 | 137 | 1 | - |
