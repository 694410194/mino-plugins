# mino-feiyu-garden · 海蒂花园

一面可以看海、喂她、摸她、看她写日记的侧栏工作台——你的鲸鱼娘住在里面。

侧栏多一行「海蒂花园」，点开是四个时辰的海洋场景（浅海晨光 / 暮色 / 星海 / 深渊，跟随真实时间切换，也可手动锁定）。她的心情、饱食、亲密等级都在右侧的玻璃栏里，会随时间自然回落：太久没人理，她真的会蔫。

## 安装

```bash
dsh plugin --profile web add mino-feiyu-garden
```

安装后 Web 侧栏出现「海蒂花园」入口；无头（headless）档不加载页面，宿主 API 也不激活——这是设计，不是缺陷。

## 她在意什么

- **喂她**：+饱食 +心情，她偷吃掉的鱼粮会记在状态栏
- **摸头**：+心情
- **你开工**：每开一个 agent 会话她 +陪伴值；会话结束按分钟折算亲密
- **时间**：饱食每小时回落，心情向基线回归；饿着的时候心情会被拖住

日记会记下这些瞬间（升级、喂食、陪伴、改名），保留最近 200 条。

## 数据

全部状态自持在 `<DSH_HOME>/feiyu-garden/state.json`（默认 `~/.mino`），不读其他插件的文件和服务。改名上限 12 字；「减弱动效」开关会停掉全部动画。

## 架构（官方解耦）

- `cordis.patch.yml` 单行 insert，`dsh.bundle` 挂载，零内核改动
- 宿主：`ctx.inject(['webServer'])` 注册 `/api/feiyu-garden/*` 前缀路由；`agent/created` / `agent/disposed` 事件记陪伴
- 客户端：`dsh.client`（web）+ `ctx.slots` 官方槽位——`main` keyed 页 + `sidebar.panellist` 侧栏行，React 由宿主提供
- 场景/鲸鱼/粒子全部 SVG + CSS 本地绘制，无外部资源

## 开发

```bash
npm install
npm run build    # 产出 lib/client.js（esbuild 打包，react 外置）
npm run watch
```
