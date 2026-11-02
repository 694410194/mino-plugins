# mino-skill-cnki

Mino 精选 **skill 包**（社区 vendored fork）：知网 CNKI 技能（10 件）——检索/解析/翻页/详情/期刊/下载/导出 Zotero 全套浏览器操作流程

上游：[cookjohn/cnki-skills](https://github.com/cookjohn/cnki-skills)，经 `mino.upstream` 记溯源，正文未改动。

## 形态

skill pack bundle：包内 `skills/` 目录随包分发，插件通过官方
`ctx.skills.registerProvider()` 公开契约注册为打包 skill provider
（rank 650，低于 bundled）——安装即出现在技能目录，卸载即消失，不写用户目录。

## 使用

- 模型侧：技能目录出现后模型可经 `skill` 工具按描述自动调用。
- 用户侧：对话输入 `/<skill-name>` 直接调用，或在技能中心查看/管理。

## 覆盖

同名 skill 按层与 rank 解析：项目 `.dsh/skills`、`.agents/skills` 或
`~/.dsh/skills` 中放同名目录即可覆盖市场包内容（provider rank 600 > 650）。

## 前置

技能内容驱动 `mcp__chrome-devtools__*` 浏览器工具——需先安装 `mino-mcp-chrome-devtools`（同属精选索引）。知网下载/导出需用户自有知网账号登录态。
