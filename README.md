# mino-plugins

一套为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）精选的插件集合，也是 **Mino**——面向普通用户的 DSH 桌面发行版——的插件源仓。

[English](#english)

## 亮点

- **60+ 件精选插件**：IM 机器人（微信/QQ/飞书/钉钉/TG/Discord/Slack/WhatsApp 多渠道）、学术写作技能（文献精读、英文润色、模拟审稿、审稿意见回复）、桌面宠物、语音、表情包、B站工具、远程通道、浏览器控制等。
- **个人数据连接器（建设中）**：把用户本机/各生态里的自有数据接给 agent——消费账单、浏览器历史、B站收藏、笔记划线、网盘、邮件、订阅扣费等（只读、本地、用户主动）。接入路线与候选域目录见 warroom supply-catalog。
- **全部走官方机制**：每个插件通过 `dsh.bundle` + `cordis.patch.yml` 组合集成，零内核改动，与上游 byte-identical 共存。
- **附带精选索引**：凡支持自定义索引的 DSH 插件市场（Discover），把索引地址加进索引列表即可直接浏览和安装本仓插件。

## 在任意 DSH 里使用本索引

如果你的 DSH 环境挂载了插件市场服务（`plugin-market`，Discover 标签页）：

1. 打开插件市场/设置里的索引配置（`indexes` 字段）。
2. 添加索引地址（二选一，内容相同）：
   - `https://mino.baby/plugins/index.json`（主源）
   - `https://cdn.jsdelivr.net/gh/694410194/mino-plugin-index@main/index.json`（镜像）
3. 保存后即可在发现页浏览本仓精选插件并安装。

> 索引只声明「装什么」，安装动作仍走 DSH 官方的 `pluginManager.installBundle` 路径；安装源为 commit 固定的 `git+https://mino.baby/git/<name>`。

## Mino 客户端

这些插件出厂预装在 **Mino** 中——一个基于 DeepSeek Harness 的消费级桌面发行版：

- 官网与下载：https://mino.baby
- 开箱即用：内置多种主流大模型接入，无需自行准备 key
- 插件市场已内置本索引

## 仓库结构

- `packages/` 各插件源码（自研与 fork，集成清单见 [INTEGRATION.md](INTEGRATION.md)）
- `eval/` 评测套件；`reports/` 兼容性与实测报告
- `templates/` 技能包模板

---

## English

A curated plugin collection for **[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)** (DSH) — and the plugin source repository for **Mino**, a consumer desktop distribution built on DeepSeek Harness.

- **60+ curated plugins**: IM bots (WeChat/QQ/Feishu/DingTalk/Telegram/Discord/Slack/WhatsApp), academic writing skills, desktop pets, voice, memes, remote access, browser control, and more.
- **Zero kernel changes**: every plugin is integrated through the official `dsh.bundle` + `cordis.patch.yml` mechanism.
- **Curated index**: `https://mino.baby/plugins/index.json` — add it to the `indexes` field of any DSH plugin-market (Discover) to browse and install these plugins.

Mino desktop client (built-in model access, no key setup required): https://mino.baby
