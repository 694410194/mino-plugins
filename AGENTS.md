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
**mino-market 已 private 退役**，由上述官方栈 + Mino 索引替代。

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
| cdn.jsdelivr.net（gh 镜像） | 可用 | 索引的公共镜像 URL：`cdn.jsdelivr.net/gh/694410194/mino-plugin-index@main/index.json` |
| registry.npmjs.org / registry.npmmirror.com | 可用 | 插件安装通道：发 npmjs，npmmirror 自动同步；索引 per-version `registry` 填 npmmirror |
| mino.baby | 可用 | **正式归宿**：`mino.baby/plugins/index.json`（deploy 件在 mino-deploy `site/plugins/` + nginx `/plugins/` 规则，sync.sh→服务器后生效） |

## plugweb 测试档（全插件实测基座）

`C:\Users\69441\.dsh\profiles\plugweb`：29 个 file: tgz 依赖（全部 mino-* 插件
+ `@deepseek-ai/dsh-mino` 账号层 bundle）+ `cordis.patch.yml` 补丁层
（magpie provider、plugin-market 两行 insert、索引 URL）。

- **dsh-mino 是账号层**：platformOrigin `platform.mino.baby`、inference
  `api.mino.baby/v1`、关上游遥测。profile 的 bundles 声明必须在 dependencies
  里有对应 file: 依赖，否则 `cannot resolve profile bundle` 静默跳过该层。
- 驱动：`D:\tmp\mino-sdk\sdk-drive.mjs`（JSON-RPC stdio，叠加 `--patch`
  overlay 实现插件开关组合）；探测集 `probes-full.json`（14 条真实任务）；
  判读看 `request/header` 工具表、`tool/call`/`tool/result`、插件 stdout。
- **测试纪律**：插件验收必须真实 agent 对话 + 原始事件流，不只看 UI 装载。
- 每次 SDK/web 启动会弹默认浏览器（`DSH_SDK_NO_BROWSER` 对 web 档无效），
  标签页堆积是测试残留，token 过期即黑屏。

## 部署事实（mino-deploy）

`site/` → `scripts/sync.sh`（工作站 rsync，需 DEPLOY_HOST/KEY）→
服务器 `/opt/mino/managed` → `auto-sync-release.sh` cron（10min，
release 指纹变化时）→ `build-site.py` 重建 → `deploy-site.sh` rsync 到
`/var/www/mino-home` → `nginx/sites/*.conf`（`location /` 默认 404，
每个可服务路径都需显式规则）。

## 产品分层事实（全量实测结论）

- **本体默认开**：persona + fish-memory + mood + speak-up（作者体系内建协同）。
- **全开 28 插件 = 130 模型工具**（browser_* 已按 `when` 门控）：tavern 系 ~58、
  bili 三插件 ~43——重场景包应在 Plugins 页标注；pilot 属高危档（真实输入控制
  + 截图上云），QQ 通道三路互斥（qqbot / im-QQ / qq-link+aurabot）。
- fish-memory `remember` 现为单注册 + when 门控；注入 text 内按请求判
  isEnabled/归档，开关切换当场生效无需装卸挂载。
