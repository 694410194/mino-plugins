# skill-pack 模板

做一个新的市场 skill 包 = 复制本目录，改三处，填 skills：

1. `cp -r templates/skill-pack packages/skill-<名>`
2. `package.json`：`name` 改 `mino-skill-<名>`，填 `description`/`version`/`keywords`，去掉 `private`
3. `cordis.patch.yml`：`id` 与 `name` 改成新包名
4. `skills/<skill-name>/SKILL.md`：写 frontmatter（`name` + `description` 必填）+ 正文

`index.js` **不改**——provider 名与插件名都自动取 `package.json` 的 `name`，保证唯一。

> 本目录是模板不是包：`private: true`，不在 `packages/` 下，verify-all 与
> 索引生成器都不会收它。改动 `index.js` 后请同步已发行的 skill-* 包副本。

## 机制（只依赖公开契约）

- bundle 安装后 patch 挂载本包插件行；插件在 `apply` 里调 `ctx.skills.registerProvider()`，
  把 `skills/` 目录（`<name>/SKILL.md` 目录包或 `<name>.md` 扁平文件）注册为一个
  远程/打包 skill provider（rank 650，永远低于用户/项目同名 skill）。
- `list()` 给候选卡（name/description/whenToUse/invocation/resourceBase），
  `get()` 每次实时重读文件——改 SKILL.md 不用重装。
- frontmatter 支持：`name` `description` `whenToUse` `disable-model-invocation`
  `user-invocable` `metadata.*`（扁平 YAML，单行标量）。
- 卸载 bundle = 行移除 = provider 注销 = skill 从目录消失，不留文件垃圾。

## 索引

非 private 的 `dsh.bundle` 包会被 `build-plugin-git-repos.sh` 打成 per-package bare 仓
（`mino.baby/git/<dir>`），生成器扫描进索引；在 `eval/catalog-annotations.json`
加 `category: skills` 即归入「技能」分类。
