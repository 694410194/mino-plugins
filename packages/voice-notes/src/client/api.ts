/** mino-voice-notes 客户端的 API 面：自有插件路由，同源 fetch 自动带会话鉴权。 */

export interface VNotePublic {
  id: string
  title: string
  status: 'recording' | 'transcribing' | 'ready' | 'failed'
  createdAt: string
  stoppedAt?: string
  segments: number
  transcript?: string
  summary?: string
  shareId?: string
  error?: string
  audioSeconds?: number
}

async function post(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(String((data as { error?: string }).error ?? res.status))
  return data
}

export async function listNotes(): Promise<VNotePublic[]> {
  const res = await fetch('/mino-voice-notes/api/list', { cache: 'no-store' })
  const data = (await res.json()) as { notes?: VNotePublic[] }
  return data.notes ?? []
}

export const startNote = (title?: string) => post('/mino-voice-notes/api/start', title ? { title } : {})
export const stopNote = (id: string) => post('/mino-voice-notes/api/stop', { id })
export const getNote = async (id: string): Promise<VNotePublic | undefined> => {
  const res = await fetch(`/mino-voice-notes/api/note?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
  if (!res.ok) return undefined
  const data = (await res.json()) as { note?: VNotePublic }
  return data.note
}
export const shareNote = (id: string) => post('/mino-voice-notes/api/share', { id })
export const deleteNote = (id: string) => post('/mino-voice-notes/api/delete', { id })
export const uploadSegment = (id: string, seq: number, wavBase64: string, durationMs: number) =>
  post('/mino-voice-notes/api/segment', { id, seq, audio: wavBase64, durationMs })
