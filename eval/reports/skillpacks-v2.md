# Eval Report

suite: suites/skillpacks.jsonl | profile: plugweb | repeat: 1 | boot: 9011ms

**2/4 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| drama-orchestrator | PASS | 24387 | 171 | 6 | - |
| screenwriting-workflow | FAIL | 120416 | 171 | 3 | reply.match; turn.timeout |
| duanju-craft | FAIL | 85647 | 171 | 10 | modelCalls.max |
| script-review | PASS | 29165 | 171 | 4 | - |
