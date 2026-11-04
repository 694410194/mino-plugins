# Eval Report

suite: eval/suites/paper-search-live.jsonl | profile: plugweb | repeat: 1 | boot: 9648ms

**0/1 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| paper-search-live | FAIL | 300422 | 195 | 17 | tools.called; reply.match; modelCalls.max; turn.timeout |
