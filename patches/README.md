# patches/

对 vendored 包（`packages/*/lib/` 被 gitignore、不随 git 走）的本地修复留档。
重 vendor / 重放包后按这里的 diff 回带修复；落账同步记在 INTEGRATION.md「本地分叉」。

| patch | 目标 | 症状 | 上游状态 |
|---|---|---|---|
| `ops-internal-update-signature.patch` | `packages/ops/lib/discovery/index.js` `ctx.on('internal/update', ...)` | 全档 `settings.update` 抛 `TypeError: next is not a function` | cc-ops@0.4.4、上游 master `src/discovery/index.ts` 同错未修 |
