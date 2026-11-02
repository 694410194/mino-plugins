# mino-skill-nature

Mino 精选 **skill 包**（社区 vendored fork）：Nature 风格学术技能（24 件）——检索/引用/精读卡/科研绘图/翻译/审稿/润色/社科写作/统计/声明等，nature-* 前缀自带命名空间

上游：[Yuan1z0825/nature-skills](https://github.com/Yuan1z0825/nature-skills)，经 `mino.upstream` 记溯源，正文未改动。

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

## 注意

5 个 SKILL.md 的多行 `description:` 已按 provider 扁平 YAML 子集规范折成单行（仅 frontmatter 格式改动，正文未动）。`nature-proposal-writer` 的上游 skill 名为 `researchwrite`（原样保留）。`nature-downloader` 等个别技能运行时需要 Node/Python/Chrome 调试通道等本机依赖，见各 SKILL.md 的 compatibility 说明。
