# connector-pack 模板

个人数据连接器的标准打包形态（warroom D38/D39：28 域全接、官方解耦、轻量默认/重型可选）。

## 接入三规（每次接入前过）

1. 需求大+已验证+合战略的域先接；
2. 办公室小白本带得动的是默认件，重型的（Docker/本地大模型）降为可选包，标记「较重」；
3. 只走官方公开缝：`dsh.bundle`+`cordis.patch.yml`、`dsh-mcp-client` 配置行、`skill-*` pack、`ctx.skills.registerProvider`——禁止耦合化改内核。

## 三种形态

| 形态 | 什么时候用 | 例子 |
|---|---|---|
| 纯配置 bundle（本模板） | 上游已是 MCP server | 百度网盘官方 MCP、ashare-mcp |
| stdio 薄封装 | 上游是 CLI/脚本 | HackBrowserData、es.exe、double-entry-generator |
| skill-pack | 上游是提示词/流程型能力 | 账单分析、年度报告生成 |

## 打包步骤

1. `cp -r templates/connector-pack packages/<connector-name>`；
2. 改 `package.json` 的 `name`（`mino-connector-<域>`）与 `description`；
3. `cordis.patch.yml` 填上游 MCP 的 `command/args/env`，或指向自家 wrapper；
4. 给 `disabled:` 写一个合理的凭据门（无凭据自动停用）；
5. 随包带一份「年度报告」skill 模板（已验证病毒形态，可选）；
6. 索引：加进 `eval/.index-input.txt` → 重生成 index.json → `enrich-index.mjs` → 三处落位（见 AGENTS 发布链）。

## 合规 checklist

- [ ] 只读：连接器不得写用户数据源
- [ ] 本地：原始数据不出本机，检索片段才进模型请求
- [ ] 用户主动：凭据/目录由用户自己配置，不静默采集
- [ ] 解密类走洛雪壳：本体不带破解能力
- [ ] README 话术：「读你自己的数据」，不出现「破解/导出」

## 实测踩过的坑（connector-bills 首件复盘，D42）

- **engines.dsh 写 `>=0.2.2-alpha.1 <0.3.0`**：模板默认 `<0.2.3` 会被
  现役运行时（0.2.5+）版本闸整条跳过（`skipping profile bundle`）。
- **`inject` 必须含 `'tools'`**：用了 `ctx.tools.register` 而 inject 只写
  `['skills']`，加载即 `cannot get property "tools" without inject`。
- **skill provider 逐字复制 `templates/skill-pack/index.js` 的实现**：
  locator=文件路径字符串、get(candidate) 返回 `content` 正文、
  `source:'market'`、`resourceBase:{kind:'directory',path}`——手写版会被
  运行时以 `non-string source` 拒绝并引发会话连环 pending。
- **vendor exe 的开发测试在中立目录跑**：未签名二进制放在 `D:\Projects\`
  源码树下会被杀软拦截文件创建（放 %TEMP%/D:\tmp 正常）；装机路径
  （`.dsh` profile）不受影响，但插件验收必须走 plugweb 实测确认。
- **验收=plugweb 真实 agent**：profile package.json 里 file: tgz 依赖
  和 `dsh.profile.bundles` 数组**两处都要加**；sdk-drive + probes 跑真实
  对话，确认模型真能 dispatch 到工具（不只是插件装载）。
- **索引重生成遇 `plugin-market-git-*` EPERM**：杀软拦 temp 目录；
  TMP/TEMP/TMPDIR 指到 `D:\tmp` 后重试可收敛一部分，残留缺口按
  「服务器 `/var/www/git/*` pins 表 + 旧索引条目」补齐再 enrich，
  **残缺索引禁止上线**（pin 错=安装全断）。
- **依赖外部 exe 的连接器必须含 engines.json 兜底**（D50 实锤）：
  engine-assist 装的引擎登记在 `~/.mino/engines.json` + `~/.mino/engines/<name>/`，
  只查 PATH+写死路径的连接器看不见它——装了等于没装。
  探测顺序：显式配置路径 → PATH → engines.json → engines/ 目录递归扫
  exe → 写死路径兜底。每家自包含 20 行，不共享模块。
- **嵌套 object schema 必须写 `additionalProperties`**（D48 实锤）：
  output schema 里 `items: { type: 'object' }` 漏写 `additionalProperties`
  会被 DSH 校验拒注册，整件工具不进模型表、无声装死。
- **output schema 对齐 emit 真字段**（D49 实锤）：声明的字段名必须和
  execute 真返回一致（如 `src` 不是 `domain`），虚写字段=每条调用撞校验。
