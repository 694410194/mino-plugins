---
name: mino-release
description: Mino 部署与发布速查。涉及 mino-deploy 上线、nginx 站点规则、插件市场索引再生、mino.baby/git 安装通道、发布 tarball 或插件包时使用。
metadata:
  author: mino
  version: "0.1.0"
---

# Mino 部署与发布速查

部署事实源在 `mino-deploy`：`site/` → `scripts/sync.sh` → 服务器 `/opt/mino/managed`
→ `auto-sync-release.sh` cron（约 10 分钟，release 指纹变化时）→ `build-site.py` 重建
→ `deploy-site.sh` rsync 到 `/var/www/mino-home` → `nginx/sites/*.conf`。

## 上线流程

1. 改 `mino-deploy/site/` 下的文件。
2. 工作站无 rsync（Windows Git Bash），用等价命令：
   `tar czf - . | ssh <host> 'tar xzf - -C <目标>'`；需 `DEPLOY_HOST`/`DEPLOY_KEY`。
3. nginx `location /` 默认 404——**每个可服务路径都要显式规则**，新路径先加 conf。

## 带宽方向不对称（实测）

工作站→服务器上行 ~80KB/s，服务器→GitHub 高速。**大文件只走 github→server 方向**：
服务器用 `git clone/fetch` 或 release 资产下载自取，绝不从工作站 push/scp 大负载。

## 插件市场通道

- 精选索引：`mino.baby/plugins/index.json`（format-1）；镜像源
  `cdn.jsdelivr.net/gh/694410194/mino-plugin-index@main/index.json`（只镜像索引，
  安装仍走 mino.baby）。
- 安装通道：服务器 `/var/www/git/<dir>` per-package bare 仓 dumb-HTTP，
  由 `build-plugin-git-repos.sh` 从 monorepo 快照拆分；索引安装目标
  `git+https://mino.baby/git/<dir>#<commit>`。
- 新包进市场：推 mino-plugins → 服务器 cron fetch → bare 仓重建 →
  重跑 `plugin-market-generator` 生成 index → **必须重跑** `node eval/enrich-index.mjs`
  （否则 category/labels/score 元数据被重置）。
- `private: true` 的包会被生成器与 bare 仓脚本同时跳过。

## 注意

- 索引 locale 键必须全小写（`zh-cn`，`zh-CN` 会让官方 parser 报错）。
- 未知顶层字段会被 format-1 parser 丢弃，不要发明 `x-*` 字段；扩展面用
  `metadata.{categories,labels,sortKeys}`。
