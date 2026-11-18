/** mino-voice-notes 自有存储：notes.json 元数据索引 + audio/<id>/<seq>.wav 分段文件。
 * 位置 `$DSH_HOME/mino-voice-notes/`（无 DSH_HOME 时 `~/.mino/mino-voice-notes/`）——
 * 与 mino-today 同一落点约定，不读其他插件私有目录。
 */
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const ROOT = join(process.env.DSH_HOME || join(homedir(), '.mino'), 'mino-voice-notes')
const AUDIO_DIR = join(ROOT, 'audio')
const STORE_FILE = join(ROOT, 'notes.json')

export type VNoteStatus = 'recording' | 'transcribing' | 'ready' | 'failed'

export interface VNoteSegment {
  seq: number
  file: string
  bytes: number
  durationMs?: number
}

export interface VNote {
  id: string
  title: string
  status: VNoteStatus
  createdAt: string
  updatedAt: string
  stoppedAt?: string
  segments: VNoteSegment[]
  transcript?: string
  summary?: string
  shareId?: string
  error?: string
  audioSeconds?: number
}

interface NotesFile { notes: Record<string, VNote> }

function ensureDirs(): void {
  mkdirSync(AUDIO_DIR, { recursive: true })
}

export function loadNotes(): Record<string, VNote> {
  try {
    const raw = readFileSync(STORE_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as NotesFile
    return parsed && typeof parsed === 'object' && parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {}
  } catch {
    return {}
  }
}

export function saveNotes(notes: Record<string, VNote>): void {
  ensureDirs()
  writeFileSync(STORE_FILE, JSON.stringify({ notes }, null, 2))
}

export function getNote(id: string): VNote | undefined {
  return loadNotes()[id]
}

export function putNote(note: VNote): void {
  const notes = loadNotes()
  notes[note.id] = note
  saveNotes(notes)
}

export function deleteNote(id: string): boolean {
  const notes = loadNotes()
  if (!notes[id]) return false
  delete notes[id]
  saveNotes(notes)
  try { rmSync(join(AUDIO_DIR, id), { recursive: true, force: true }) } catch { /* 音频目录缺失按无处理 */ }
  return true
}

export function segmentPath(id: string, seq: number): string {
  return join(AUDIO_DIR, id, `seg-${String(seq).padStart(4, '0')}.wav`)
}

export function appendSegment(id: string, seq: number, wav: Buffer, durationMs?: number): VNoteSegment {
  const dir = join(AUDIO_DIR, id)
  mkdirSync(dir, { recursive: true })
  const file = segmentPath(id, seq)
  writeFileSync(file, wav)
  return { seq, file, bytes: wav.length, ...(durationMs !== undefined ? { durationMs } : {}) }
}

export function readSegment(id: string, seq: number): Buffer | undefined {
  try { return readFileSync(segmentPath(id, seq)) } catch { return undefined }
}

export function newId(): string {
  return `vn_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
