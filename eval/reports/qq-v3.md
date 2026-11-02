# Eval Report

suite: suites/qq-link.jsonl | profile: plugweb | repeat: 1 | boot: 3556ms

**5/8 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| qq-state-noauth | PASS | - | - | - | - |
| qq-save-noauth | PASS | - | - | - | - |
| qq-testsend-noauth | PASS | - | - | - | - |
| qq-receive-public | FAIL | - | - | - | http.expectStatus |
| qq-notice-filter | PASS | - | - | - | - |
| qq-state-authed | FAIL | - | - | - | http.expectStatus |
| sa-api-noauth | PASS | - | - | - | - |
| sa-api-authed | FAIL | - | - | - | http.expectStatus |
