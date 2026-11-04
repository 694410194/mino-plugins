/**
 * mino-connector-invoice —— 发票连接器（conn-finance 域）。
 * 扫指定文件夹里的电子发票：OFD（国标电票，zip 包 XML）本地解出抬头/金额/日期；
 * PDF 版式文件做文件名+正文字符串启发式提取。只读、本地，汇总成 CSV 清单。
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { homedir, tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { loadHostDeps } from './hostdeps.mjs'
import { createSkillProvider } from './skill-provider.mjs'

const execFileP = promisify(execFile)
const PKG_DIR = dirname(fileURLToPath(import.meta.url))
const PKG = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'))
const STORE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'connector-invoice')

export const name = PKG.name
export const inject = ['skills', 'tools']
const defineTool = (await loadHostDeps()).defineTool

const pick = (xml, tags) => {
  for (const t of tags) {
    const m = xml.match(new RegExp(`<[^>]*${t}[^>]*>([^<]*)<`, 'i'))
    if (m?.[1]) return m[1].trim()
  }
  return ''
}

async function readOfd(file) {
  // OFD = zip；Expand-Archive 只认 .zip 后缀，先复制成 .zip 再解
  const tmp = join(tmpdir(), `ofd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  const zipPath = `${tmp}.zip`
  try {
    const { copyFileSync } = await import('node:fs')
    copyFileSync(file, zipPath)
    await execFileP('powershell', ['-NoProfile', '-Command',
      `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${tmp.replace(/'/g, "''")}' -Force`],
      { timeout: 30000, windowsHide: true })
  } catch { return null }
  const xmlPaths = []
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (/OriginalDoc\.xml$/i.test(e.name)) xmlPaths.push(p)
    }
  }
  walk(tmp)
  if (!xmlPaths.length) return null
  const xml = readFileSync(xmlPaths[0], 'utf8')
  return {
    发票号码: pick(xml, ['InvoiceCode', 'InvoiceNo', 'eFinNum']),
    开票日期: pick(xml, ['IssueDate', 'fKPRQ', 'Kprq']),
    销售方: pick(xml, ['SellerName', 'salerName']),
    购买方: pick(xml, ['BuyerName', 'buyerName']),
    价税合计: pick(xml, ['TaxInclusiveTotalAmount', 'totalTax-included', 'TotalAmount', 'jshj']),
  }
}

function readPdfText(file) {
  // 无依赖启发式：抽 PDF 文本流里明文（未压缩流有效，压缩流退化）
  const buf = readFileSync(file)
  const s = buf.toString('latin1')
  const texts = []
  for (const m of s.matchAll(/\(([^)]{2,120})\)\s*Tj/g)) texts.push(m[1])
  const joined = texts.join(' ')
  return {
    发票号码: joined.match(/\d{20}/)?.[0] || '',
    开票日期: joined.match(/20\d{2}[年\-\/]\d{1,2}[月\-\/]\d{1,2}/)?.[0] || '',
    价税合计: joined.match(/[¥￥]\s*(\d[\d,]*\.?\d*)/)?.[1] || joined.match(/(\d+\.\d{2})\s*元/)?.[1] || '',
    note: texts.length ? undefined : 'PDF 文本流压缩，建议先转 OFD 或用文件名线索',
  }
}

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'invoice_scan',
    description:
      '扫一个文件夹里的电子发票（.ofd/.pdf，含子目录），提取发票号码/日期/销售方/金额，' +
      '汇总成 CSV 写到 ~/.dsh/connector-invoice/invoices.csv。只读你的文件。',
    parameters: {
      dir: { type: 'string', required: true, description: '发票文件夹绝对路径' },
    },
    output: { schema: { type: 'object', additionalProperties: false, properties: {
      count: { type: 'integer' }, csv: { type: 'string' },
      rows: { type: 'array', items: { type: 'object', additionalProperties: true } } } },
      render: (_a, v) => [{ type: 'text', text: `识别 ${v.count} 张发票 → ${v.csv}` }] },
    isConcurrencySafe: () => true,
    async execute(args) {
      const dir = String(args.dir || '').trim()
      if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new Error(`invoice_scan: 目录不存在 ${dir}`)
      const files = []
      const walk = (d) => {
        for (const e of readdirSync(d, { withFileTypes: true })) {
          const p = join(d, e.name)
          if (e.isDirectory()) walk(p)
          else if (/\.(ofd|pdf)$/i.test(e.name)) files.push(p)
        }
      }
      walk(dir)
      if (!files.length) throw new Error(`invoice_scan: ${dir} 里没有 .ofd/.pdf 发票`)
      const rows = []
      for (const f of files.slice(0, 500)) {
        const ext = f.toLowerCase().endsWith('.ofd') ? 'ofd' : 'pdf'
        const info = ext === 'ofd' ? await readOfd(f) : readPdfText(f)
        rows.push({ file: basename(f), path: f, type: ext, ...(info || { 识别失败: 'OFD 结构异常' }) })
      }
      mkdirSync(STORE, { recursive: true })
      const csv = join(STORE, 'invoices.csv')
      const cols = ['发票号码', '开票日期', '销售方', '购买方', '价税合计', 'file', 'path', 'type']
      writeFileSync(csv, cols.join(',') + '\n' + rows.map(r =>
        cols.map(c => `"${String(r[c] || '').replace(/"/g, '""')}"`).join(',')).join('\n') + '\n', 'utf8')
      return { count: rows.length, csv, rows: rows.slice(0, 50) }
    },
    presentCall: (a) => ({ card: 'generic', title: '扫发票', kind: 'other', rawInput: a }),
  }))

  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(ctx)))
}
