// 轻量 i18n：默认中文，界面语言为英文时切英文。
import { useSyncExternalStore } from 'react'

const DICT = {
  '海蒂花园': 'Feiyu Garden',
  '她的小海，你的花园': 'Her little sea, your garden',
  '心情': 'Mood',
  '饱食': 'Fed',
  '亲密': 'Bond',
  '喂她': 'Feed her',
  '摸头': 'Pat',
  '日记': 'Diary',
  '级': 'Lv.',
  '升级进度': 'Level progress',
  '雀跃': 'Elated',
  '开心': 'Happy',
  '平静': 'Calm',
  '蔫蔫': 'Down',
  '委屈': 'Upset',
  '刚刚': 'just now',
  '分钟前': 'm ago',
  '小时前': 'h ago',
  '天前': 'd ago',
  '场景': 'Scene',
  '跟随时间': 'Follow time',
  '浅海': 'Shallows',
  '暮色': 'Dusk',
  '星海': 'Starry',
  '深渊': 'Abyss',
  '改名': 'Rename',
  '叫她什么': 'Her name',
  '保存': 'Save',
  '取消': 'Cancel',
  '减弱动效': 'Reduce motion',
  '声音': 'Chime',
  '设置': 'Settings',
  '累计偷吃': 'Tokens nibbled',
  '陪伴分钟': 'minutes together',
  '次会话': 'sessions',
  '分钟': 'min',
  '摸头 ×': 'pats ×',
  '喂食 ×': 'feeds ×',
  '花园加载中': 'Waking the sea…',
  '花园加载失败': 'Failed to load the garden',
  '重试': 'Retry',
  '同步中': 'syncing',
  '离线': 'offline',
  '正在同步': 'Syncing state',
  '同步失败，仍在重试': 'Sync failed, still retrying',
  '清空示例': '',
}

const listeners = new Set()
let cur = detect()

function detect() {
  try {
    const lang = document.documentElement.lang || navigator.language || 'zh'
    return lang.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  } catch {
    return 'zh'
  }
}

export function lang() { return cur }

export function t(s, vars) {
  let out = cur === 'en' ? (DICT[s] ?? s) : s
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replace(`{${k}}`, v)
  return out
}

export function useLang() {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb) }, () => cur)
}
