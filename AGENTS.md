# AGENTS.md

Mino 插件生态：全部走官方 `dsh.bundle` + `cordis.patch.yml` 组合，零内核改动。
包清单与接入清单见 [INTEGRATION.md](INTEGRATION.md)。

## 依赖的官方 DSH 契约（稳定性边界）

只依赖出现在生成文档（`docs/subsystems/*.md`、包 README）里的公开机制；
上游破坏它们要走公开 breaking-change 通道。已知不可依赖的内部细节列在每条后面。

- **`ctx.tools.register(def, { when })`**：每步装配前评估 `when`，false 时工具既不进
  schema 也不能 dispatch。同名工具**绝不注册第二份**：作用域注册按对象遮蔽全局注册，
  已入场工具按对象同一性校验 → 换对象即当场 `unknown tool`（fish-memory issue #15 根因）。
- **`ctx.on('agent/created')`**：serial、被 await、保证早于首次 prompt 组装。
  按会话挂载用它，**不要轮询 `agents.list()`**（fish-memory 0.5s tick 已删）。
- **`agent.ctx` 作用域注册**：section/context/listener 随 agent 作用域销毁自动回滚；
  但**插件卸载不会**回滚 agent 作用域上的注册 → 插件需自持 `mounted` 账做卸载清理。
- **`agent/disposed`**：agent 离开注册表后 emit，用于清理按实例记的账。
- 会话归属判定用 `session.header` 的 `agentPreset` / `origin` 等**持久化字段**
  （版本化最严），不要用运行时推断（内部会话/preset 会话过滤靠这个）。
- **`engines.dsh`**：安装/加载的版本闸门；未声明时回落 `peerDependencies` 里
  `@deepseek-ai/dsh-*` 区间的合取。维护策略：覆盖已验证的大版本线（如
  `>=0.2.2-alpha.1 <0.2.3`），新版本验证后扩线，不用版本豁免当长期手段。
- **`disabled: !!js`** 表达式可用于 cordis 行级条件合成（见 plugin-market 挂法）。
- **bundle patch 可 insert 官方包行**：`name: '@deepseek-ai/dsh-<pkg>'` 随宿主
  安装解析，与 plugweb patch 插 `plugin-market` 两行同机制。`mcp-*` 系列纯配置
  bundle 即此形态：每个包插一条 `dsh-mcp-client` 行（`serverName`/`transport`/
  stdio `command`/`args`/`env` 或 streamable-http `url`/`headers`），凭据走
  `env`/`headers` 里的 `!!js process.env.*`，未配时 `disabled: !!js` 整行停用。
- **`ctx.skills.registerProvider(create)`**：打包 skill 的公开缝。provider
  `{name, list→candidates, get→definition}` 同步注册即进 catalog；candidate 需
  `rank`+`locator`+`resourceBase`，`get` 每次实时重读文件。`skill-*` pack
  （模板 `templates/skill-pack`）rank 650 低于 bundled(600)，同名永远被
  用户/项目 skill 覆盖；provider 名取 package.json `name` 保证 per-layer 唯一。

## 插件市场与分发

官方栈：`plugin-market`（索引读取+兼容标注，服务无 HTTP 面，`detail-file`
是唯一路由）+ `ui-plugin-market`（Plugins 页 Discover 标签）+ `plugin-manager`
（`installBundle` 实际执行）+ `plugin_market` 工具（仅 Creator preset 子树注册）。
**mino-market 保留**：官方栈索引只列 Mino 精选 40 个包，社区全量目录
（awesome-dsh-plugin 注册表，非 format-1）只有它能读——两者互补并存：
「发现」= 自有精选（mino.baby 通道），「插件市场」= 社区入口。
其附带的 backup（profile 配置导出）/drain/channels 为额外功能。

- 索引格式：`@deepseek-ai/dsh-plugin-market-index` format 1，单 JSON；
  安装目标**只接受** npm spec（含 per-version `registry`）或 commit 固定的
  `git+https` + `path:`，tarball 直链不是合法源。
- 生成器：`mino-agent/apps/plugin-market-generator`（官方，tsx 源码直跑：
  `pnpm exec tsx src/bin.ts --input <list> --output <index.json> --title <t>`），
  输入每行一个 npm 包名或公开 Git 仓 URL；Git 源按 workspace glob/`dsh.bundle`
  扫描包，**`private: true` 的包会被跳过**——private 在本仓的语义是"不分发"
  （comma=WIP、market=退役），workspace 排除走 `pnpm-workspace.yaml` 负向 glob。
- 发布物：`github.com/694410194/mino-plugin-index`（index.json + icons/，
  与源仓 mino-plugins 分离，产物不进源仓）。

### 网络可达性（中国大陆直连实测，2026-11）

| 通道 | 直连 | 用途 |
|---|---|---|
| github.com / raw.githubusercontent.com | **超时** | 不能当用户侧通道；开发 push 走本机代理 `127.0.0.1:7897`（`https_proxy=`） |
| cdn.jsdelivr.net（gh 镜像） | 可用 | **已接入**：Discover 第二源 `cdn.jsdelivr.net/gh/694410194/mino-plugin-index@main/index.json`（插件页市场下拉可切换；推 GitHub 后 `purge.jsdelivr.net` 刷缓存） |
| registry.npmjs.org / registry.npmmirror.com | 可用 | npm 通道备用：`npmjs.com` 注册页被反爬拦（代理出口 IP 亦 403），暂无 npm 账号 → 自家包安装通道=自建 git（`/git/` dumb-HTTP）。**第三方 npm 包已接入**（dsh-guizang-design）：`.index-input.txt` 直接写包名行，生成时带 `--registry https://registry.npmmirror.com/`，索引 per-version `registry` 落 npmmirror |
| mino.baby | 可用 | **正式归宿（第一源）**：`mino.baby/plugins/index.json` + `/git/<name>` 每插件 bare 仓 dumb-HTTP 安装通道。⚠ 镜像不对称：jsdelivr 只镜像索引（图标相对路径自动连带），**安装仍走 mino.baby/git**——安装通道的冗余要 npm 才解得了 |

## 发布链（刚性顺序，勿跳步）

插件源码到用户可装之间是五段串联，任何一段没走完就停手 = 线上断链：

1. `git push origin main`（GitHub；直连 reset 时走 `127.0.0.1:7897` 代理）。
2. 服务器跑 `sudo bash /opt/mino/managed/scripts/build-plugin-git-repos.sh`：
   镜像 fetch GitHub → 全量重拆 `/var/www/git/<name>` 孤儿快照仓。
   **重拆后全部快照 commit 失效**——索引里的旧 pin 立刻作废，下一步不可省。
3. 工作站重生成索引：`plugin-market-generator` 跑 `eval/.index-input.txt`
   → `node eval/enrich-index.mjs <index.json>` 富化（内部过 `parseMarketIndex`
   校验）。跑前清 `eval/.plugin-market-cache/`，否则拿旧 clone 生成旧 pin；
   Windows 下 `TMP`/`TEMP` 指到 `D:\tmp\pmgtmp`（Node 读 TMP/TEMP，
   `TMPDIR` 是 POSIX 变量无效），杀软锁 Temp 会随机 EPERM 丢源——
   缓存累积成功源，反复重跑直到 `0 failed source(s)`；failed>0 的
   产物绝不可用（exit code 1）。
   清单混排两类源：`mino.baby/git/<name>`=自家包、`包名`=第三方 npm 包；
   含 npm 行时生成器必须带 `--registry https://registry.npmmirror.com/`。
   抽查：index 引用的每个 `icons/*` 文件必须已入库（mino-im 曾因漏交
   文件导致图标 404）；npm 条目须带 per-version `registry` 字段。
4. 三处落位：服务器 `/var/www/mino-home/plugins/index.json`（site/ 同步 +
   `deploy-site.sh`）、`694410194/mino-plugin-index` 仓（jsdelivr 第二源，
   推后 `purge.jsdelivr.net` 刷缓存）、mino-deploy 仓 `site/plugins/index.json`
   提交——三处必须同一份内容。
5. `mino-plugin-releases` 手动 tgz 通道（`plugins-v*` tag）：非刚性但 docs
   页挂链接；`build-site.py` 里的 tag 必须指向已存在的 release——
   **先发 release 再改脚本**，顺序不能反。

配套红线：

- **`/opt/mino/managed` 是同步副本不是真相**：跑其脚本前先 tar 同步本仓
  （2026-11-03 事故：managed 旧脚本写 `<name>.git` 目录，索引 URL 落在
  未更新的 `<name>` 目录上，重拆出的新仓全部白跑）。
- **`site/plugins/index.json` 是部署态**：`deploy-site.sh` `rsync --delete`
  整个 site/，本地旧副本会静默回滚线上索引；动 site/ 前先与线上 diff。
- 推了 mino-plugins 却不打算当天走完整链，至少别让服务器跑拆分；
  跑了就必须把索引链走完。

## plugweb 测试档（全插件实测基座）

`C:\Users\69441\.dsh\profiles\plugweb`：29 个 file: tgz 依赖（全部 mino-* 插件
+ `@deepseek-ai/dsh-mino` 账号层 bundle）+ `cordis.patch.yml` 补丁层
（magpie provider、plugin-market 两行 insert、索引 URL）。

- **dsh-mino 是账号层**：platformOrigin `platform.mino.baby`、inference
  `api.mino.baby/v1`、关上游遥测。profile 的 bundles 声明必须在 dependencies
  里有对应 file: 依赖，否则 `cannot resolve profile bundle` 静默跳过该层。
- 驱动：`D:\tmp\mino-sdk\sdk-drive.mjs`（JSON-RPC stdio，spawn 自带
  `--no-open`；叠加 `--patch` overlay 实现插件开关组合）；探测集
  `probes-full.json`（14 条真实任务）；判读看 `request/header` 工具表、
  `tool/call`/`tool/result`、插件 stdout。
- **stdio 探针桥**：`sdk-jsonrpc-server` 只 inject `agents`+`workingDirectory`，
  可插进任意 profile（web 档共存无冲突）——给 plugweb patch 插
  `sdk-app-startup`(`profile: sdk`)+`sdk-jsonrpc-server`(`inject:
  [sdkAppStartup, loader]`) 两行即可对全插件树跑 JSON-RPC。`plugtest` 档只有
  `dsh-base` 没有 sdk-app → `initialize` 永不响应（timeout initialize）。
- **宿主机服务边界**：superagent/comma 依赖 `sessionController`/
  `workspaceRegistry`/`agentPresets`/`webServer`——这些只有 web/desktop 档
  的 `dsh-web-app` bundle 提供；纯 stdio 档它们 pending 不激活是**设计使然**
  不是插件缺陷（待办：comma/superagent 的 README 应写明宿主档位要求）。
- **会话持久路由**：session.header 记创建时刻的 provider/model；上游 provider
  没了后**每次 turn 都报 `NO_ADAPTER`**（comma-router 实测踩中）。修法：删掉
  旧 session 让插件按当前默认重建；长期应让 comma 支持 pin routerModel。
- **`~/.dsh/sessions/<workspace>/` 下不能有非 session 目录**：扫描器校验
  header id vs 目录名，改名/杂物目录=「corrupt session log」→ dsh-workspace
  插件报错 → workspaceRegistry 永不 provide → sessionController 及全部下游
  （superagent/comma/bridge/speak-up…）连锁 pending。备份移出 sessions 树。
  同样地，删 session 目录不解 `storages/workspace.json` 的归属账——一个
  session 被两个 workspace 同时认领会让 dsh-workspace 报
  `workspace domain is inconsistent` 并同样连环 pending。
- **SDK 会话只读全局工具层**（sdk server 不走 preset 组合）；web-app bundle
  里 `tool-fs`/`tool-fs-search`/`tool-bash`/`tool-pwsh`/`tool-skill` 等
  host-plane 行默认 `disabled: true`（preset realm 负责模型面）。要给探针
  会话文件/shell 工具，在 patch 里 `disabled: false` 放开即可——preset
  注册按对象遮蔽全局注册，web 会话不受影响。spawn env 另需
  `SSH_CONNECTION`（官方"远端启动"判据，禁开浏览器）和 `DSH_PRIMARY_RUNTIME`
  （`<install>/resources/runtime/primary-runtime`，供 workspace-dependencies）。
- **dsh-superagent 要 `stateDir`**（orchestrator sqlite/锁/worker 工作目录，
  schema 强制 `/^\/` 开头）：Windows 下用扩展长度路径
  `//?/C:/Users/.../state/superagent`——`/Users/...` 会按进程 cwd 盘符解析，
  从 D: 启动落到 `D:\Users\...`；锁是 proper-lockfile 进程内登记，
  清 stateDir 不能解"already held"，要找真占用或换路径。
- **测试纪律**：插件验收必须真实 agent 对话 + 原始事件流，不只看 UI 装载。
- **启动必须带 `--no-open`**（web-app 官方 flag，`dsh --profile plugweb --no-open`）：
  不带则每次 boot 弹默认浏览器攒一排 token 过期黑屏页（`DSH_SDK_NO_BROWSER`
  对 web 档无效）。新 token 见 stdout `dsh web: http://...?token=...`，
  旧 token 全部作废；浏览器黑屏先 Ctrl+Shift+R 硬刷再查 console。

## 部署事实（mino-deploy）

`site/` → `scripts/sync.sh`（工作站 rsync，需 DEPLOY_HOST/KEY；Windows Git
Bash 无 rsync，用 `tar czf - . | ssh ... 'tar xzf -'` 等价执行）→
服务器 `/opt/mino/managed` → `auto-sync-release.sh` cron（10min，
release 指纹变化时）→ `build-site.py` 重建 → `deploy-site.sh` rsync 到
`/var/www/mino-home` → `nginx/sites/*.conf`（`location /` 默认 404，
每个可服务路径都需显式规则）。

**带宽方向不对称（实测 2026-11）**：工作站→服务器上行仅 ~80KB/s，
服务器→github 却是高速（212MB clone 约 2min，auto-sync cron 直连
api.github.com 0.02s）。**大文件只走 github→server 方向**：服务器用
`git clone/fetch` 或 release 资产下载自取，绝不从工作站 git push/scp
大负载。插件安装源即此模式：`/var/www/git/mino-plugins.git` bare 镜像
（服务器 fetch github + `update-server-info`）由
`build-plugin-git-repos.sh` 重拆成 `/var/www/git/<name>` 每插件单仓孤儿
快照，nginx `/git/` 只读 dumb-HTTP 对外，索引安装目标为
`git+https://mino.baby/git/<name>` commit 固定。

## 产品分层事实（全量实测结论）

- **本体默认开**：persona + fish-memory + mood + speak-up（作者体系内建协同）。
- **全开 28 插件 = 130 模型工具**（browser_* 已按 `when` 门控）：tavern 系 ~58、
  bili 三插件 ~43——重场景包应在 Plugins 页标注；pilot 属高危档（真实输入控制
  + 截图上云），QQ 通道三路互斥（qqbot / im-QQ / qq-link+aurabot）。
- fish-memory `remember` 现为单注册 + when 门控；注入 text 内按请求判
  isEnabled/归档，开关切换当场生效无需装卸挂载。

### 索引评测元数据管线（enrich-index）

重新生成 `index.json` 后**必须**重跑富化，否则 metadata 被生成器重置：
`node eval/enrich-index.mjs <index.json>`（标注源 `eval/catalog-annotations.json`，
评分与 EVAL.md 同步）。官方 `parseMarketIndex` 验证后才写出；
locale 键必须全小写（`zh-cn`，`zh-CN` 会炸）。

- format-1 官方扩展面：index 级 `metadata.{categories,labels,sortKeys}` 声明 +
  插件级 `metadata.{category,labels,sortKeys.<id>:number}`——**未知顶层字段会被
  parser 丢弃**，不要发明 `x-*` 字段。
- 官方 ui-plugin-market 实测消费：标签渲染成卡片 Tag、分类进过滤栏、
  `sortKeys` 支持按分排序（dsh-client-ui-plugin-market client.js 确认）。
- **第三方署名真相源=包 manifest**：索引卡片的作者/链接取
  `author`/`repository`/`homepage`。上游源包这三项必须指上游（脚本
  `scripts/attribute-upstream.py` 批量补登；homepage 已合法指包内路径
  的不动）；Mino 原创包不留 author 即可。annotation 的 labels 与生成器
  labels 在 enrich 里按集合合并，互不覆盖。
- **署名以包内 `NOTICE`/`LICENSE` 为实锤，不凭猜测**：vendor 进仓时
  NOTICE 记了真实上游（`Fork of/Derived from <url>`），比 GitHub 搜索
  猜出的仓名可靠——二批已更正三例凭猜错误：qq-console zjw0011→
  shenhua725、browser yuxianglin/dsh-bridge-browser(404)→
  omdsh-dev/dsh-browser、bili-live 仓改名 dsh-bili-danmaku-lite。
  repository.url 指上游时删掉 `repository.directory`（那是 monorepo
  子目录语义，上游仓没有该路径）。`mino.upstream` 记 `owner/repo`
  血缘供 drift 追踪，connector 包驱动的外部引擎是运行时依赖不算
  上游，不记。
- 部署：`site/plugins/index.json` 随 sync.sh 上服务器；`build-site.py` 不碰它。

## 版本策略（与官方解耦，但不破坏生态兼容）

- **运行时 fork**（`@deepseek-ai/dsh-*` 在 mino-agent 里）：固定形态
  `<upstream-ver>.mino.<n>`（如 `0.2.2-alpha.2.mino.1`）。**不能**换成纯自有
  版本线（1.0.0）：社区插件 peer 门按 installed 版本算区间合取，脱离上游
  tuple 会让全部插件 gate 失败。`.mino.N` 就是我们的版本段——每次 Mino
  运行时发布 +1，上游 base 升级时归 1。代价：精确版本 peer（`=x.y.z`）
  会失配——区间声明才是社区常态，目前 40 精选零命中。
- **mino-* 插件**：自有 semver，**不跟踪上游版本号**（`mino-qq-link 1.5.0`
  这类镜像上游号是历史遗留，下次 bump 起走自有线）。上游 parity 写进
  `package.json` 的 `mino.upstream`（如 `"dsh-qq-link@1.5.0"`），供 drift
  追踪；索引/安装不消费它。
- **索引版本**：git commit-pinned，与包 version 无耦合；npm 通道启用后
  版本号才成硬约束。

## 构建产物入库纪律（2026-11-05 立）

- 市场 git 安装通道拿的是 git 树：凡 `package.json.main` 指向 `lib/`、`dist/`、`plugin/`、`native-dist/` 的包，产物必须随 src 一并提交（force-add，.gitignore 有意保留）。
- 改了 src 的同提交必须 rebuild 并提交产物；验收命令 `node eval/verify-dist.mjs`（重建全部可建包+报 git 漂移，exit≠0 即产物陈旧）。
- vendored 预构建包（有 lib 无 src）本体即真相源，verify 自动跳过。
- 已知无法源码重建的包（vendor 时构建配置缺失，产物安装正确）：browser/drawio/im/qqbot/task-board/voice——从上游补 vendor 时连构建配置一起拿（better-sidebar 已示范：补 tsconfig+tsdown.config 后可重建）。
- 服务器分裂脚本对 main 缺失的包打 WARN，发布时看到 WARN 不许放行。
