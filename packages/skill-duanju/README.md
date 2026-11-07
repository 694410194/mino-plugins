# short-drama

Mino 精选 **skill 包**（社区 vendored fork）：微短剧剧本创作技能 `duanju-craft` + 8 份工艺参考（13 题材模板、钩子、卡点、爽感矩阵、反派、合规清单）。上游 skill 原名 `short-drama`，与 skill-drama 包编排器撞名，进包改名 `duanju-craft`（仅 frontmatter，正文未动）。

上游：[0xsline/short-drama](https://github.com/0xsline/short-drama)（MIT），经 `mino.upstream` 记溯源，正文未改动。

## 形态

skill pack bundle：包内 `skills/` 目录随包分发，插件通过官方
`ctx.skills.registerProvider()` 公开契约注册为打包 skill provider
（rank 650，低于 bundled）——安装即出现在技能目录，卸载即消失，不写用户目录。

## 使用

- 模型侧：技能目录出现后模型可经 `skill` 工具按描述自动调用。
- 用户侧：对话输入 `/<skill-name>` 直接调用，或在技能中心查看/管理。

## 覆盖

同名 skill 按层与 rank 解析：项目 `.dsh/skills`、`.agents/skills` 或
`~/.mino/skills` 下放同名 skill 即覆盖本包对应项。
