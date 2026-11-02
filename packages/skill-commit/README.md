# mino-skill-commit

Mino 精选 **skill 包**：把 `commit-message` 技能（规范中文 git commit 写作约定）
装进 `ctx.skills`。

## 形态

skill pack bundle：包内 `skills/` 目录随包分发，插件通过官方
`ctx.skills.registerProvider()` 公开契约注册为打包 skill provider
（rank 650，低于 bundled）——安装即出现在技能目录，卸载即消失，不写用户目录。

## 使用

- 模型侧：技能目录出现后模型可经 `skill` 工具调用；写 commit 时会按约定执行。
- 用户侧：对话输入 `/commit-message` 直接调用，或在技能中心查看/管理。

## 覆盖

同名 skill 按层与 rank 解析：项目 `.dsh/skills`、`.agents/skills` 或
`~/.dsh/skills` 下放同名 `commit-message` 即覆盖本包。
