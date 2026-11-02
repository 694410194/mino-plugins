# Eval Report

suite: suites/skillpacks.jsonl | profile: plugweb | repeat: 1 | boot: 10037ms

**0/4 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| drama-orchestrator | FAIL | 120425 | 170 | 4 | tools.called; reply.match; turn.timeout |
| screenwriting-workflow | FAIL | 43823 | 170 | 8 | tools.called |
| duanju-craft | FAIL | 120407 | 170 | 6 | tools.called; reply.match; turn.timeout |
| script-review | FAIL | 42346 | 170 | 10 | tools.called; modelCalls.max |
