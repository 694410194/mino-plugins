# Eval Report

suite: suites/qq-link.jsonl | profile: plugweb | repeat: 1 | boot: 3632ms

**0/6 probes pass-all** 

| probe | verdict | median ms | tools | modelCalls | fails |
|---|---|---|---|---|---|
| qq-state-noauth | FAIL | - | - | - | http.expectStatus |
| qq-save-noauth | FAIL | - | - | - | http.expectStatus |
| qq-testsend-noauth | FAIL | - | - | - | http.expectStatus |
| qq-receive-public | FAIL | - | - | - | http.expectStatus |
| qq-notice-filter | FAIL | - | - | - | http.expectStatus |
| sa-api-live | FAIL | - | - | - | http.expectStatus |
