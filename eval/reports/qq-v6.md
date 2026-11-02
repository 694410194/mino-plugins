# Eval Report

suite: suites/qq-link.jsonl | profile: plugweb | repeat: 1 | boot: 3923ms

**4/5 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| qq-mgmt-post-blocked | PASS | - | - | - | - |
| qq-receive-post-blocked | PASS | - | - | - | - |
| sa-api-csrf | PASS | - | - | - | - |
| sa-api-authed | FAIL | - | - | - | http.expectStatus |
| sa-api-wrongorigin | PASS | - | - | - | - |
