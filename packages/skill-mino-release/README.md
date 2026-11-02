# mino-skill-mino-release

Mino 精选 **skill 包**：把 `mino-release` 技能（Mino 部署/发布速查）装进
`ctx.skills`——sync.sh 上线流程、nginx 显式规则、插件 git 通道、索引再生管线、
带宽不对称约束。

## 形态

skill pack bundle：包内 `skills/` 目录随包分发，插件通过官方
`ctx.skills.registerProvider()` 公开契约注册为打包 skill provider
（rank 650，低于 bundled）——安装即出现在技能目录，卸载即消失，不写用户目录。

## 使用

- 模型侧：部署、发布、插件市场索引相关任务自动可调用。
- 用户侧：`/mino-release` 直接调用。
