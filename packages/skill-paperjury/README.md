# paperjury

Mino 精选 **skill 包**（社区 vendored fork）：投稿前 AI 审稿（1 件）——paperjury：多视角审稿人模拟 + 三模式 + 台账/再审，自带 references/configs/scripts 支撑树

上游：[Spark-To-Paper-Skills/paperjury](https://github.com/Spark-To-Paper-Skills/paperjury)，经 `mino.upstream` 记溯源，正文未改动。

## 形态

skill pack bundle：包内 `skills/` 目录随包分发，插件通过官方
`ctx.skills.registerProvider()` 公开契约注册为打包 skill provider
（rank 650，低于 bundled）——安装即出现在技能目录，卸载即消失，不写用户目录。

## 使用

- 模型侧：技能目录出现后模型可经 `skill` 工具按描述自动调用。
- 用户侧：对话输入 `/<skill-name>` 直接调用，或在技能中心查看/管理。

## 覆盖

同名 skill 按层与 rank 解析：项目 `.dsh/skills`、`.agents/skills` 或
`~/.mino/skills` 中放同名目录即可覆盖市场包内容（provider rank 600 > 650）。
