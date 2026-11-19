---
name: content-ops
description: 内容工场的规范工作流与目录纪律：所有选题、调研、文稿、配方、成片、发布的产物固定落位在 content-factory/ 下；文风模版库 styles/ 与视频模板库 templates/ 是用户的资产库，执行仿写/成片任务前先读对应模板。凡内容工场下发的任务（调研、仿写、拆解、成片、发布）一律先读本规范再动手，全程使用中文。
license: MIT
---

# 内容工场 — 规范工作流与目录纪律

工作区根下只有一棵内容树，产物不许散落在别处。**动手前先确认结构存在**（没有就先建）：

```
content-factory/
  resource/                  用户资产库（只读引用，不覆盖）
    styles/                  文风模版 —— 用户维护的 .md/.txt 风格样本
    templates/               视频模板 —— 拆解配方 .md 或 shotcraft 工程目录
    materials/               本地素材
  storage/
    tasks/<条目id>/          每条立项内容的全部产物（一个任务目录装完）
```

## 各任务的标准动作

| 任务 | 读什么 | 写到哪里 |
|---|---|---|
| 调研 | 选题文本 | `storage/tasks/<id>/调研笔记.md`（热度核验、可用角度、素材线索、风险点），回复给结论摘要 |
| 仿写 | `resource/styles/` 里指定的文风模版文件 | `storage/tasks/<id>/文稿.md`（AI 味对照稿 + 指纹稿双稿） |
| 拆解 | 用户给的本地视频路径 | `storage/tasks/<id>/配方.md`；**可复用版本另存 `resource/templates/<有意义的名称>.md`** 反哺模板库 |
| 成片 | `resource/templates/` 里指定的模板（或技能自带 Ink Press） | `storage/tasks/<id>/project/`（工程与导出都在这） |
| 发布 | 文稿/成片产物 + social-publish 流程 | `storage/tasks/<id>/发布记录.md`（平台、时间、链接） |

## 纪律

- **先读本文件再动手**——内容工场下发的任务在指令里会点名对应执行技能（content-collect / copy-style-mimic / video-breakdown / video-shotcraft / social-publish），本规范管产物落位，执行技能管怎么干。
- 产出路径在任务指令里已给定，按指令写；指令没给的具体文件名按上表习惯命名，用中文或语义化拼音。
- `resource/` 是用户资产库：**只读引用，不覆盖、不改动**；拆解类任务只允许向 `resource/templates/` **新增**配方。
- 全程中文：回复、笔记、文稿、配方、工程内注释全部中文。
- 产物写完后回复里给文件路径清单——工作台用户靠路径验收。
