/**
 * mino-connector-legacy —— 数字遗产连接器（conn-system 域，skill 驱动形态）。
 * 本体不注册工具：盘点动作复用 local-inventory/inventory_overview + 各连接器数据。
 * 只提供一个 skill 指引模型帮用户做数字资产/数字遗产清点文档。
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSkillProvider } from './skill-provider.mjs'

const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))

export const name = PKG.name
export const inject = ['skills']

export function apply(ctx) {
  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
