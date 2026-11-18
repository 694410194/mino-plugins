/**
 * mino-today 的共享小组件：时钟 hook、相对时间格式化、chip/徽标。
 * 纯展示 —— 数据都从 props 进来。
 */
import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'

/** 每 30s 跳一次的本地时钟（相对时间、进行中任务时长用）。 */
export function useNow(stepMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), stepMs)
    return () => clearInterval(timer)
  }, [stepMs])
  return now
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** HH:mm 本地时间。 */
export function hhmm(isoOrMs: string | number | undefined): string {
  if (isoOrMs === undefined) return ''
  const d = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs)
  if (Number.isNaN(d.getTime())) return ''
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** YYYY-MM-DD 本地日期键（与 host dayKey 一致）。 */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** 动态卡按 Today 的简报批次分桶：晨间（05-12）/下午（12-18）/晚间（18-05）。 */
export function batchOf(iso: string): 'morning' | 'afternoon' | 'evening' {
  const h = new Date(iso).getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  return 'evening'
}

/** 相对时间：刚刚 / N 分钟前 / N 小时前 / HH:mm（跨天给日期）。 */
export function relTime(iso: string, nowMs: number): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = nowMs - t
  if (diff < 60_000) return 'now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${hhmm(iso)}`
}

/** 任务时长：Ns / N分Ns / N时N分Ns。 */
export function durationText(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m${s % 60 ? `${s % 60}s` : ''}`
  const h = Math.floor(m / 60)
  return `${h}h${m % 60 ? `${m % 60}m` : ''}`
}

/**
 * Today 卡片的指针追光（解包 TOHVBq 协议）：pointer 相对卡心求方位角写
 * --cursor-angle，按到最近边的归一化距离写 --edge-proximity（>0.3 才显光，
 * 离开归零）。事件挂在卡根元素上，CSS 里 .edgeLight 子层消费这两个 var。
 */
export function edgeGlowHandlers<E extends HTMLElement>(): {
  onPointerMove: (e: ReactPointerEvent<E>) => void
  onPointerLeave: (e: ReactPointerEvent<E>) => void
} {
  return {
    onPointerMove(e) {
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const deg = (Math.atan2(y - r.height / 2, x - r.width / 2) * 180) / Math.PI
      const edge = Math.min(x, r.width - x, y, r.height - y)
      const proximity = Math.max(0, 1 - edge / (0.45 * Math.min(r.width, r.height)))
      el.style.setProperty('--cursor-angle', `${deg}deg`)
      el.style.setProperty('--edge-proximity', String(Math.max(0, (proximity - 0.3) / 0.7)))
    },
    onPointerLeave(e) {
      e.currentTarget.style.setProperty('--edge-proximity', '0')
    },
  }
}
