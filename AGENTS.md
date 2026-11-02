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
| registry.npmjs.org / registry.npmmirror.com | 可用 | npm 通道备用：`npmjs.com` 注册页被反爬拦（代理出口 IP 亦 403），暂无 npm 账号 → **当前安装通道=自建 git**（`/git/` dumb-HTTP）；将来发 npmjs 后 npmmirror 自动同步，索引 per-version `registry` 填 npmmirror |
| mino.baby | 可用 | **正式归宿（第一源）**：`mino.baby/plugins/index.json` + `/git/<name>` 每插件 bare 仓 dumb-HTTP 安装通道。⚠ 镜像不对称：jsdelivr 只镜像索引（图标相对路径自动连带），**安装仍走 mino.baby/git**——安装通道的冗余要 npm 才解得了 |

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
（服务器 cron fetch github + `update-server-info`），nginx `/git/`
只读 dumb-HTTP 对外，索引安装目标为
`git+https://mino.baby/git/mino-plugins.git#commit path:packages/<name>`。

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
- 部署：`site/plugins/index.json` 随 sync.sh 上服务器；`build-site.py` 不碰它。
