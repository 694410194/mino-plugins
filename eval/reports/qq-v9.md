# Eval Report

suite: suites/qq-link.jsonl | profile: plugweb | repeat: 1 | boot: 3544ms

**3/5 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| qq-mgmt-post-blocked | FAIL | - | - | - | http.expectStatus |
| qq-receive-post-blocked | FAIL | - | - | - | http.expectStatus |
| sa-api-csrf | PASS | - | - | - | - |
| sa-api-authed | PASS | - | - | - | - |
| sa-api-wrongorigin | PASS | - | - | - | - |
