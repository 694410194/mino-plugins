# mino-skill-drama

Mino 精选 **skill 包**（社区 vendored fork）：AI 短剧/漫剧全流程 11 个技能：short-drama（编排）、novel-analyze、develop、write、assets、image-prompts、storyboard、video-prompts、produce、edit、review。

上游：[zenstory-ai/drama-skills](https://github.com/zenstory-ai/drama-skills)（MIT），经 `mino.upstream` 记溯源，正文未改动。

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
