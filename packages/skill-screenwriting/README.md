# mino-skill-screenwriting

Mino 精选 **skill 包**（社区 vendored fork）：26 个编剧技能（sw-*），蒸馏自 47 本工艺书与 23 部公开剧本；sw-workflow 为编排器，含剧集 S0–S7 阶段表与 story-bible 约定。

上游：[jtydhr88/screenwriting-skills](https://github.com/jtydhr88/screenwriting-skills)（MIT），经 `mino.upstream` 记溯源，正文未改动。

## 形态

skill pack bundle：包内 `skills/` 目录随包分发，插件通过官方
`ctx.skills.registerProvider()` 公开契约注册为打包 skill provider
（rank 650，低于 bundled）——安装即出现在技能目录，卸载即消失，不写用户目录。

## 使用

- 模型侧：技能目录出现后模型可经 `skill` 工具按描述自动调用。
- 用户侧：对话输入 `/<skill-name>` 直接调用，或在技能中心查看/管理。

## 覆盖

同名 skill 按层与 rank 解析：项目 `.dsh/skills`、`.agents/skills` 或
`~/.dsh/skills` 下放同名 skill 即覆盖本包对应项。
