---
name: commit-message
description: 写规范、有信息量的 git commit message。用户要求提交、写 commit、整理提交说明或 review 提交历史时使用。约定 type/scope/subject/body 结构、中文风格与"为什么"优先原则。
metadata:
  author: mino
  version: "0.1.0"
---

# Commit Message 写作约定

写 commit message 时，先想清楚这条提交**为什么存在**，再写"做了什么"。

## 结构

```
<type>(<scope>): <subject>

<body>
```

- `type`：`feat` 新功能 / `fix` 修 bug / `refactor` 重构（不改行为）/ `perf` 性能 /
  `docs` 文档 / `test` 测试 / `chore` 杂项（构建、依赖、工具链）/ `style` 格式 /
  `revert` 回滚
- `scope`：可选，受影响的模块或包名，如 `(plugin-market)`、`(fish-memory)`
- `subject`：一行祈使句，≤72 字符，结尾不加句号；说清楚"做了什么"即可
- `body`：与 subject 空一行分隔；写**动机、取舍、坑**，不复述 diff 能看到的东西

## 原则

- 一条提交一个意图；混在一起就拆，而不是写更长的 message。
- subject 用英文或仓库已有风格；body 可用中文。跟随仓库 `git log` 的既有语言与格式。
- 修 bug 的 body 先写根因（root cause），再写修法；只写"修复 xxx 问题"等于没写。
- 涉及破坏性变更（配置键、持久化格式、公开 API），在 body 末尾加
  `BREAKING CHANGE: <影响与迁移>`。
- 引用 issue/PR 用 `#123`；引用其他提交用短 sha。
- 不提交密钥、token、私有路径；message 里也不复述。

## 提交前自查

1. `git status` + `git diff`（staged 与 unstaged 都看）确认改动范围与 message 一致。
2. 不要把无关文件顺手提交进去；不确定的文件问用户。
3. message 写完后自己读一遍：半年后的人能否只看 message 明白这次提交的必要性。
