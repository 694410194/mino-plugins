/** mino-voice-notes 客户端的 API 面：自有插件路由，同源 fetch 自动带会话鉴权。 */
export interface VNotePublic {
    id: string;
    title: string;
    status: 'recording' | 'transcribing' | 'ready' | 'failed';
    createdAt: string;
    stoppedAt?: string;
    segments: number;
    transcript?: string;
    summary?: string;
    shareId?: string;
    error?: string;
    audioSeconds?: number;
}
export declare function listNotes(): Promise<VNotePublic[]>;
export declare const startNote: (title?: string) => Promise<Record<string, unknown>>;
export declare const stopNote: (id: string) => Promise<Record<string, unknown>>;
export declare const getNote: (id: string) => Promise<VNotePublic | undefined>;
export declare const shareNote: (id: string) => Promise<Record<string, unknown>>;
export declare const deleteNote: (id: string) => Promise<Record<string, unknown>>;
export declare const uploadSegment: (id: string, seq: number, wavBase64: string, durationMs: number) => Promise<Record<string, unknown>>;
