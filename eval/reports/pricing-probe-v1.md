# Eval Report

suite: suites/pricing-probe.jsonl | profile: plugweb | repeat: 1 | boot: 9832ms

**0/6 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| price-read | FAIL | 1721 | 193 | 1 | tools.called; reply.match |
| price-read-f1 | FAIL | 471 | 0 | 1 | reply.match |
| price-read-f2 | FAIL | 465 | 0 | 1 | reply.match |
| price-polish | FAIL | 604 | 193 | 1 | tools.called; reply.match |
| price-review | FAIL | 982 | 193 | 1 | tools.called; reply.match |
| price-litreview | FAIL | 652 | 193 | 1 | tools.called; reply.match |
