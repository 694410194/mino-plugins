# Eval Report

suite: suites/agent-pricing.jsonl | profile: scholar | repeat: 1 | boot: 1596ms

**0/8 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| agent-read | FAIL | 102741 | 9 | 16 | reply.match |
| agent-read-f1 | FAIL | 20083 | 0 | 1 | reply.match |
| agent-polish | FAIL | 94037 | 9 | 8 | reply.match |
| agent-review | FAIL | 64139 | 9 | 8 | reply.match |
| agent-rebuttal | FAIL | 85652 | 9 | 12 | reply.match |
| agent-lit4 | FAIL | 100943 | 9 | 25 | reply.match |
| agent-ps | FAIL | 20000 | 9 | 2 | reply.match |
| agent-quick | FAIL | 7212 | 9 | 1 | reply.match |
