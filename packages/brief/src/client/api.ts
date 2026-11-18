/** 同源 API 薄封装（mino-brief 自有路由）。 */
export interface PrefsSlot {
  slot: 'morning' | 'evening'
  title: string
  enabled: boolean
  hasEntry: boolean
  time: string
  preference: string
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'same-origin' })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json() as Promise<T>
}
async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  prefs: () => getJson<{ ok: boolean; slots: PrefsSlot[] }>('/mino-brief/api/prefs'),
  savePrefs: (body: { slot: string; preference?: string; enabled?: boolean; time?: string }) =>
    postJson<{ ok: boolean }>('/mino-brief/api/prefs', body),
}
