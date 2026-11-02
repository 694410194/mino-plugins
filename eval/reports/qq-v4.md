# Eval Report

suite: suites/qq-link.jsonl | profile: plugweb | repeat: 1 | boot: 3713ms

**5/6 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| qq-state-get | PASS | - | - | - | - |
| qq-mgmt-post-blocked | PASS | - | - | - | - |
| qq-receive-post-blocked | PASS | - | - | - | - |
| sa-api-csrf | PASS | - | - | - | - |
| sa-api-authed | FAIL | - | - | - | http.expectStatus |
| sa-api-wrongorigin | PASS | - | - | - | - |
